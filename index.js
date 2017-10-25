var fs = require('fs');
var Table = require('cli-table');
var json2csv = require('json2csv');

var argv = require('minimist')(process.argv.slice(2));

(function main() {
  var inputFile = argv._[0];
  var exportCsv = argv.e;

  if (!inputFile) {
    console.log('You must provide the path to the feature test results.','\n');
    console.log('Example:', 'trendy-cucumber ./feature-results.json', '\n');
    process.exit(1);
  }

  readFile(inputFile, (json) => {
      var highLevelMetrics = displayHighLevelMetrics(json);
      var featureMetrics = displayFeatureMetrics(json);

      if (exportCsv) {
        fs.writeFile(
          'high_level_metrics.csv',
          tableToCsv(highLevelMetrics),
          (err) => err && console.error(err)
        );
        fs.writeFile(
          'feature_metrics.csv',
          tableToCsv(featureMetrics),
          (err) => err && console.error(err)
        );
      }
  });
})();


/**
 * Read the provided filename.
 *
 * If an error occurs while reading the file, then the function logs an error
 * and returns, not error callback is called.
 *
 * @param fileName  {String} path to the cucumber json results
 * @param onSuccess {Function} that accepts a JSON object of the read contents.
 */
function readFile(fileName, onSuccess) {
  fs.readFile(fileName, (error, data) => {
    if (!error) {
      onSuccess(JSON.parse(data.toString()));
    } else {
      console.log('Error Parsing JSON Results file at:', fileName);
    }
  });
};


/**
 * Initialize a Summary Object for Features and Scenarios
 *
 * Objcect defines, total, passing, and failing counts for features, and
 * scenarios.
 *
 * @return  {Object}
 */
function initHighLevelMetricsObject() {
  return {
    features: {
      total: 0,
      passing: 0,
      failing: 0,
      empty: 0
    },
    scenarios: {
      total: 0,
      passing: 0,
      failing: 0
    }
  }
}


/**
 * Extract High Level Metrics for Features and Scenarios.
 *
 * @param   jsonResults - {Object} containing test results for cucumber tests.
 * @return  {Object} of High Level Metrics with Counts based on input file.
 */
function extractHighLevelMetrics(jsonResults) {
  var metrics = initHighLevelMetricsObject();

  jsonResults.forEach((result) => {
    metrics.features.total += 1;

    if (!result.elements) {
      metrics.features.empty += 1;
      return;
    }

    var hasFailingScenario = false;
    result.elements.forEach((element) => {
      if (element.keyword === 'Scenario') { // Avoid Counting Backgrounds
        var passed = didScenarioPass(element.steps);
        metrics.scenarios.total += 1; // Tally Scenario Total
        metrics.scenarios.passing += passed ? 1 : 0;
        metrics.scenarios.failing += !passed ? 1 : 0;
        hasFailingScenario = hasFailingScenario || !passed;
      }
    });
    metrics.features.passing += !hasFailingScenario ? 1 : 0;
    metrics.features.failing += hasFailingScenario ? 1 : 0;
  });

  return metrics;
}


/**
 * Returns an object with starting value for name, uri of a feature, and
 * total, passing, and failing counts of scenarios within the feature.
 *
 * @return {Object} of metrics for a scenarios within a single feature.
 */
function initFeatureMetricsObject() {
  return {
      name: '',
      uri: '',
      total: 0,
      passing: 0,
      failing: 0
  };
}


/**
 * Extract metrics for individual metrics.
 *
 * @param   jsonResults - {Object} containing test results for cucumber tests.
 * @return  {Array} of {Object} containing metrics for each feature.
 */
function extractFeatureMetrics(jsonResults) {
  var featureMetrics = [];

  jsonResults.forEach((result) => {
    var metrics = initFeatureMetricsObject()
    metrics.name = result.name;
    metrics.uri = result.uri;

    if (!result.elements) {
      return;
    }

    result.elements.forEach((element) => {
      if (element.keyword === 'Scenario') { // Avoid Counting Backgrounds
        var passed = didScenarioPass(element.steps);
        metrics.total += 1; // Tally Scenario Total
        metrics.passing += passed ? 1 : 0;
        metrics.failing += !passed ? 1 : 0;
      }
    });

    featureMetrics.push(metrics);
  });

  return featureMetrics;
}


/**
 * Helper method that helps to determine if the scenario passed.
 *
 * @param steps - {Array} containing the {Object} of results of each step.
 * @return {Boolean} indicating if the scenario passed.
 */
function didScenarioPass(steps) {
  var totalPassed = steps.reduce((total, step) => {
    return total + (step.result.status === 'passed' ? 1 : 0);
  }, 0);

  return totalPassed == steps.length;
}


/**
 * Calculate the percent and return a formatted string.
 *
 * @param   numerator - {Number}
 * @param   numerator - {Denominator}
 * @results {String} of the percentage to 2 decimal places
 */
function percent(numerator, denominator) {
    if (denominator == 0) {
      return '0%';
    }
    return (100 * numerator / denominator).toFixed(2) + '%';
}

/**
 * Parse the High Level Metrics into a row for the table.
 *
 * @param   metric - {Object} containing: passing, failing, total counts
 * @results {Array} containing: # Passing, % Passing, # Failing, % Failing, Total
 */
function printableRow(metric) {
  var passing = metric.passing;
  var failing = metric.failing;
  var total = metric.total;
  return [passing, percent(passing, total), failing, percent(failing, total), total];
}


/**
 * Display the High Level Metrics given the JSON test results
 *
 * @param   json - {Object} test results.
 */
function displayHighLevelMetrics(json) {
  var metrics = extractHighLevelMetrics(json);
  var table = new Table({
    head: [
      '',
      'Passed',
      '% Passed',
      'Failed',
      '% Failed',
      'Total'
    ]
  });

  table.push(
      {'Features': printableRow(metrics.features)},
      {'Scenarios': printableRow(metrics.scenarios)}
  );

  console.log(table.toString());

  return table;
}

/**
 * Returns a function to be used with `Array.reduce`.
 *
 * @param   {String} key used to access a key within the object
 * @return  {Function} that sums all items with a given key.
 */
function sumWithKey(key) {
  return (total, current) => {
    return total + current[key];
  }
}

/**
 * Parse the Feature Metrics into a row for the table.
 *
 * Note: All percentages are in relation to the grand total.
 *
 * @param   metric - {Object} containing: passing, failing, total scenario counts
 *                   for a single feature.
 * @param   grandTotal - totalNumber of Scenarios accross all features.
 * @results {Array} containing: # Passing, % Passing, # Failing, % Failing, % of Grand Total
 */
function printableFeatureRow(metric, grandTotal) {
  var passing = metric.passing;
  var failing = metric.failing;
  var total = metric.total;
  return [
    passing,
    percent(passing, grandTotal),
    failing,
    percent(failing, grandTotal),
    total,
    percent(total, grandTotal)
  ];
}


/**
 * Display the Feature Metrics given the JSON test results
 *
 * @param   json - {Object} test results.
 */
function displayFeatureMetrics(json) {
  var metrics = extractFeatureMetrics(json);
  var totalScenarios = metrics.reduce(sumWithKey('total'), 0);
  var totalPassingScenarios = metrics.reduce(sumWithKey('passing'), 0);
  var totalFailingScenarios = metrics.reduce(sumWithKey('failing'), 0);
  var table = new Table({
    head: [
      'Feature Name',
      'Scenarios Passed',
      '% Scenarios Passed',
      'Scenarios Failed',
      '% Scenarios Failed',
      'Total',
      '% Total'
    ]
  });

  metrics.forEach((featureMetrics) => {
    var value = {};
    value[featureMetrics.name.substr(0, 30)] = printableFeatureRow(featureMetrics, totalScenarios);
    table.push(value);
  });

  table.push([
    '',
    totalPassingScenarios,
    percent(totalPassingScenarios, totalScenarios),
    totalFailingScenarios,
    percent(totalFailingScenarios, totalScenarios),
    totalScenarios,
    '100%'
  ]);

  console.log(table.toString());

  return table;
}

/**
 * Get CSV string result from Table instance
 *
 * @param   table - {Table} table to convert
 * @results {String} - CSV result
 */
function tableToCsv(table) {
  var fields = table.options.head.map((field) => {
    return field || '_';
  });
  var data = table.map((row) => {
    var r = row instanceof Array ? row : row[Object.keys(row)[0]];
    return fields.reduce((memo, field, index) => {
      memo[field] = r[index];
      return memo;
    }, {});
  });
  return json2csv({
    fields: fields,
    data: data
  });
}

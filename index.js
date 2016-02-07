var fs = require('fs');
var Table = require('cli-table');

var inputFile = process.argv[2];

if (!inputFile) {
  console.log('You must provide the path to the feature test results.','\n');
  console.log('Example:', 'trendy-cucumber ./feature-results.json', '\n');
  process.exit(1);
}

function readFile(fileName, onSuccess) {
  fs.readFile(fileName, (error, data) => {
    if (!error) {
      onSuccess(JSON.parse(data.toString()));
    } else {
      console.log('Error Parsing JSON Results file at:', fileName);
    }
  });
};

function initHighLevelMetricsObject() {
  return {
    features: {
      total: 0,
      passing: 0,
      failing: 0
    },
    scenarios: {
      total: 0,
      passing: 0,
      failing: 0
    }
  }
}

function extractHighLevelMetrics(jsonResults) {
  var metrics = initHighLevelMetricsObject();

  jsonResults.forEach((result) => {
    metrics.features.total += 1;

    var hasFailingScenario = false;
    result.elements.forEach((element) => {
      if (element.type === 'scenario') { // Avoid Counting Backgrounds
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

function initFeatureMetricsObject() {
  return {
      name: '',
      uri: '',
      total: 0,
      passing: 0,
      failing: 0
  };
}

function extractFeatureMetrics(jsonResults) {
  var featureMetrics = [];

  jsonResults.forEach((result) => {
    var metrics = initFeatureMetricsObject()
    metrics.name = result.name;
    metrics.uri = result.uri;

    result.elements.forEach((element) => {
      if (element.type === 'scenario') { // Avoid Counting Backgrounds
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

function didScenarioPass(steps) {
  var totalPassed = steps.reduce((total, step) => {
    return total + (step.result.status === 'passed' ? 1 : 0);
  }, 0);

  return totalPassed == steps.length;
}

function printableRow(metric) {
  var passing = metric.passing;
  var failing = metric.failing;
  var total = metric.total;
  return [passing, percent(passing, total), failing, percent(failing, total), total];
}

function displayHighLevelMetrics(json) {
  var metrics = extractHighLevelMetrics(json);
  var table = new Table({ head: ["", "Passed", "% Passed", 'Failed', '% Failed', 'Total'] });

  table.push(
      {'Features': printableRow(metrics.features)},
      {'Scenarios': printableRow(metrics.scenarios)}
  );

  console.log(table.toString());
}

function percent(numerator, denominator) {
    if (denominator == 0) {
      return '0%';
    }
    return (100 * numerator / denominator).toFixed(2) + '%';
}

function printableFeatureRow(metric, grandTotal) {
  var passing = metric.passing;
  var failing = metric.failing;
  var total = metric.total;
  return [passing, percent(passing, grandTotal), failing, percent(failing, grandTotal), percent(total, grandTotal)];
}

function displayFeatureMetrics(json) {
  var metrics = extractFeatureMetrics(json);
  var totalScenarios = metrics.reduce((total, current) => { return total + current.total;}, 0);
  var totalPassingScenarios = metrics.reduce((total, current) => { return total + current.passing;}, 0);
  var totalFailingScenarios = metrics.reduce((total, current) => { return total + current.failing;}, 0);

  var table = new Table({ head: ["Feature Name", "Scenarios Passed", "% Scenarios Passed", 'Scenarios Failed', '% Scenarios Failed', '% Total'] });

  metrics.forEach((featureMetrics) => {
    var value = {};
    value[featureMetrics.name.substr(0, 30)] = printableFeatureRow(featureMetrics, totalScenarios);
    table.push(value);
  });

  var totalsRow = [
    '', totalPassingScenarios, percent(totalPassingScenarios, totalScenarios),
    totalFailingScenarios, percent(totalFailingScenarios, totalScenarios), '100%'
  ]
  table.push(totalsRow)
  console.log(table.toString());
}

readFile(inputFile, (json) => {
    displayHighLevelMetrics(json);
    displayFeatureMetrics(json);
});

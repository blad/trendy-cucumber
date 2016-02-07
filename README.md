<p align="center">
<img src="https://dl.dropboxusercontent.com/u/40306891/trendy-cucumber-logo.png" align="center"/>
</p>


# Trendy Cucumber
Cucumber Reporting Tool to Generate Summaries from Test Results


## Example Usage
```
trendy-cucumber ./test/feature-test-results.json
```

## Example Output
```
┌───────────┬────────┬──────────┬────────┬──────────┬───────┐
│           │ Passed │ % Passed │ Failed │ % Failed │ Total │
├───────────┼────────┼──────────┼────────┼──────────┼───────┤
│ Features  │ 4      │ 80.00%   │ 1      │ 20.00%   │ 5     │
├───────────┼────────┼──────────┼────────┼──────────┼───────┤
│ Scenarios │ 18     │ 85.71%   │ 3      │ 14.29%   │ 21    │
└───────────┴────────┴──────────┴────────┴──────────┴───────┘
┌───────────────────────────┬──────────────────┬────────────────────┬──────────────────┬────────────────────┬─────────┐
│ Feature Name              │ Scenarios Passed │ % Scenarios Passed │ Scenarios Failed │ % Scenarios Failed │ % Total │
├───────────────────────────┼──────────────────┼────────────────────┼──────────────────┼────────────────────┼─────────┤
│ User Registration         │ 5                │ 23.81%             │ 3                │ 14.29%             │ 38.10%  │
├───────────────────────────┼──────────────────┼────────────────────┼──────────────────┼────────────────────┼─────────┤
│ User Login                │ 5                │ 23.81%             │ 0                │ 0.00%              │ 23.81%  │
├───────────────────────────┼──────────────────┼────────────────────┼──────────────────┼────────────────────┼─────────┤
│ Admin Login               │ 2                │ 9.52%              │ 0                │ 0.00%              │ 9.52%   │
├───────────────────────────┼──────────────────┼────────────────────┼──────────────────┼────────────────────┼─────────┤
│ Admin Dashboard           │ 4                │ 19.05%             │ 0                │ 0.00%              │ 19.05%  │
├───────────────────────────┼──────────────────┼────────────────────┼──────────────────┼────────────────────┼─────────┤
│ Admin User Creation       │ 2                │ 9.52%              │ 0                │ 0.00%              │ 9.52%   │
├───────────────────────────┼──────────────────┼────────────────────┼──────────────────┼────────────────────┼─────────┤
│                           │ 21               │ 85.71%             │ 3                │ 14.29%             │ 100%    │
└───────────────────────────┴──────────────────┴────────────────────┴──────────────────┴────────────────────┴─────────┘

```


## Generating JSON for Tests

Trendy Cucumber accepts json input. You can generate json output specify the `--format` parameter 

```
cucumberjs --format json:./test/feature-test-results.json
```

## License (MIT)

```
Copyright (c) 2016 Bladymir Tellez <btellez@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

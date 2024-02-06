# mocha-github-actions-reporter
Report for mocha that outputs Github Actions annotations

## reporterOptions
```JavaScript
var mocha = new Mocha({
    reporter: 'mocha-github-actions-reporter',
    reporterOptions: {
	// allows to map the filenames provided by mocha to paths in your repository
        convertPath: ['/opt/', '']
    }
});
```

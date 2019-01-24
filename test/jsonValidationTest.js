const assert = require('chai').assert;
const Mocha = require('mocha');
const fs = require('fs');

describe('Validating Cohorts...', () => {
    const cohortPath = './Cohorts';

    it('Verifying .cohort files', function (done) {
        let failedList = [];
        browseDirectory(cohortPath, (error, results) => {
            results.filter(file => file.substr(-7) === '.cohort')
                .forEach(file => {
                    validateJsonStringAndGetObject(file)
                });

            done();
        });
    });

    it('Verifying cohort settings files', function (done) {
        browseDirectory(cohortPath, (error, results) => {
            if (error) throw error;
            results.filter(file => file.substr(-13) === 'settings.json')
                .forEach(file => {
                    let settings = validateJsonStringAndGetObject(file);
                    validateSettingsForCohort(settings, file);
                });

            done();
        });
    });

    it('Verifying cohort category files', function (done) {
        browseDirectory(cohortPath, (error, results) => {
            if (error) throw error;
            results.filter(file => file.substr(-22) === 'categoryResources.json')
                .forEach(file => {
                    let category = validateJsonStringAndGetObject(file);
                    validateCategory(category, file);
                });

            done();
        });
    });
});

describe('Validating Workbooks...', () => {
    const cohortPath = './Workbooks';

    it('Verifying .workbook files', function (done) {
        let failedList = [];
        browseDirectory(cohortPath, (error, results) => {
            results.filter(file => file.substr(-9) === '.workbook')
                .forEach(file => {
                    validateJsonStringAndGetObject(file)
                });

            done();
        });
    });

    it('Verifying workbook settings.json files', function (done) {
        browseDirectory(cohortPath, (error, results) => {
            if (error) throw error;
            results.filter(file => file.substr(-13) === 'settings.json')
                .forEach(file => {
                    let settings = validateJsonStringAndGetObject(file)
                    validateSettingsForWorkbook(settings, file);
                });

            done();
        });
    });

    it('Verifying workbook category json files', function (done) {
        browseDirectory(cohortPath, (error, results) => {
            if (error) throw error;
            results.filter(file => file.substr(-22) === 'categoryResources.json')
                .forEach(file => {
                    let category = validateJsonStringAndGetObject(file);
                    validateCategory(category, file);
                });

            done();
        });
    });
});

var browseDirectory = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    browseDirectory(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

function validateJsonStringAndGetObject(file) {
    let json = fs.readFileSync(file, 'utf8');
    let obj = TryParseJson(json, file)    
    return obj;
}

function validateSettingsForCohort(settings, file) {
    ["$schema", "name", "author"].forEach( field => checkProperty(settings, field, file) );
}

function validateSettingsForWorkbook(settings, file) {
    ["$schema", "name", "author", "galleries"].forEach( field => checkProperty(settings, field, file) );
    if (!Array.isArray(settings.galleries)) {
        assert.fail("The galleries should be an array with '" + file + "'");
    }
}

function validateCategory(category, file) {
    checkProperty(category, 'en-us', file);
    ["name", "description", "order"].forEach( field => checkProperty(category['en-us'], field, file) );
}

function checkProperty(obj, name, file) {
    if (!obj) {
        assert.fail("Can't check a property. The object is undefined.");
    }

    if (!obj.hasOwnProperty(name)) {
        assert.fail("The " + name + " field is missing with '" + file + "'");
    }
}

function TryParseJson(str, file) {
    try {
        return JSON.parse(str);
    } catch (e) {
        assert.fail('Invalid json format with \'' + file + '\'.\n' + e);
        return null;
    }
}
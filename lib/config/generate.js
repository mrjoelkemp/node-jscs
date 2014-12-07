var Checker = require('../checker');
var utils = require('../utils');
var path = require('path');
var Vow = require('vow');
var vowNode = require('vow-node');
var Table = require('cli-table');
var prompt = require('prompt');
var get = vowNode.promisify(prompt.get.bind(prompt));

/**
 * Script that walks the user through the autoconfig flow
 * @type {String[]}
 */
var prompts = [
    'Please choose a preset number:',
    'Create an (e)xception for this rule, or (f)ix this issue:'
];

/**
 * Generated configuration through the autoconfig flow
 * @type {Object}
 */
var config = {};

/**
 * Generates a configuration object based for the given path
 * based on the best fitting preset
 *
 * @param  {Object} options
 * @param  {Object} options.presets - List of registered presets
 * @param  {Object} options.path - The path containing files used to infer the configuration
 * @param  {Object} options.checker
 *
 * @return {Object} The generated JSCS configuration
 */
module.exports = function(options) {
    options = options || {};

    var checker = options.checker;
    var _path = options.path;
    var presetNames = Object.keys(checker.getConfiguration().getPresets());

    if (utils.isRelativePath(_path)) {
        _path = path.resolve(checker.getConfiguration().getBasePath(), _path);
    }

    console.log('Checking', _path, 'against the presets');

    prompt.start();
    prompt.message = '';
    prompt.delimiter = '';

    return Vow.all(presetNames.map(checkAgainstPreset.bind(null, _path)))
    .then(function(results) {
        var errorsCollection = [].concat.apply([], results);
        var errorCounts = getErrorCounts(errorsCollection);

        outputPresetErrorCounts(presetNames, errorCounts);

        return get(prompts[0])
        .then(function(choiceObj) {
            var choice = getPresetChoice(choiceObj, presetNames);
            var errorsList = errorsCollection[choice.index].getErrorList();

            config.preset = choice.name;

            console.log('You chose the ' + choice.name + ' preset');
            console.log(_path + ' has ' + errorsList.length + ' violations');

            var errorPrompts = generateErrorHandlingPrompts(errorsList);

            return get(errorPrompts)
            .then(function(choices) {
                errorPrompts.forEach(function(errorPrompt, idx) {
                    var associatedError = errorsList[idx];
                    var userChoice = choices[errorPrompt];

                    processViolationChoice(userChoice, associatedError.rule);
                });

                return config;
            });
        });
    });
};

function generateErrorHandlingPrompts(errorsList) {
    return getUniqueErrorNames(errorsList).map(function(ruleName) {
        return 'Violated rule: ' + ruleName + ' ' + prompts[1];
    });
}

function getUniqueErrorNames(errorsList) {
    var errorNameLUT = {};

    errorsList.forEach(function(error) {
        errorNameLUT[error.rule] = true;
    });

    return Object.keys(errorNameLUT);
}

function getPresetChoice(choice, presetNames) {
    var presetIndex = choice[prompts[0]] - 1;
    var presetName = presetNames[presetIndex];

    if (!presetName) {
        console.error('You supplied an invalid preset number');
        throw new Error();
    }

    return {
        name: presetName,
        index: presetIndex
    };
}

function processViolationChoice(choice, ruleName) {
    var lower = choice.toLowerCase();

    if (lower === 'e') {
        config[ruleName] = null;

    } else if (lower === 'f') {
        console.log('Okay, skipping that rule.');

    } else {
        console.log('Invalid choice. Skipping rule');
    }
}

function outputPresetErrorCounts(presetNames, errorCounts) {
    var table = new Table({
        chars: {
            top: '', 'top-mid': '', 'top-left': '', 'top-right': '',
            bottom: '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
            left: '', 'left-mid': '',
            mid: '', 'mid-mid': '',
            right: '', 'right-mid': '' ,
            middle: ' '
        },
        style: {
            'padding-left': 0,
            'padding-right': 0
        },
        head: ['', 'Preset', '#Errors']
    });

    presetNames.forEach(function(name, idx) {
        table.push([idx + 1, name, errorCounts[idx]]);
    });

    console.log(table.toString());
}

function getErrorCounts(errorsCollection) {
    return errorsCollection.map(function(error) {
        return error.getErrorCount();
    });
}

function checkAgainstPreset(path, presetName) {
    var checker = new Checker();

    checker.getConfiguration().registerDefaultRules();
    checker.configure({preset: presetName});

    return checker.checkPath(path);
}

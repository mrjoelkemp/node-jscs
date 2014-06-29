var assert = require('assert');
var tokenHelper = require('../token-helper');
var allOperators = require('../utils').binaryOperators.filter(function (op) {
    return op !== ',' && op !== ':';
});

module.exports = function() {};

function buildOperatorList(options, key) {
    var optionValue = options[key];
    if (optionValue === undefined) {
        return {}
    } else {
        if (!Array.isArray(optionValue) && optionValue !== true) {
            throw new Error('Option `binaryOperators.' + key + '` requires array or `true` value');
        }
        var operators = optionValue === true ? allOperators : optionValue;
        return operators.reduce(function (object, value) {
            object[value] = true;
            return object;
        }, {});
    }
}

module.exports.prototype = {
    configure: function(options) {
        assert(
            typeof options === 'object',
            'Rule `binaryOperators` requires object value'
        );

        this._spaceBefore = buildOperatorList(options, 'spaceBefore');
        this._noSpaceBefore = buildOperatorList(options, 'noSpaceBefore');
        this._spaceAfter = buildOperatorList(options, 'spaceAfter');
        this._noSpaceAfter = buildOperatorList(options, 'noSpaceAfter');
    },

    getOptionName: function() {
        return 'binaryOperators';
    },

    check: function(file, assert) {
        var _this = this;

        // For everything else
        file.iterateNodesByType(
            ['BinaryExpression', 'AssignmentExpression', 'LogicalExpression', 'VariableDeclarator'],
            function(node) {
                var operator;
                var expression;

                if (node.type === 'VariableDeclarator') {
                    expression = node.init;
                    operator = '=';
                } else {
                    operator = node.operator;
                    expression = node.right;
                }

                if (expression === null) {
                    return;
                }

                var operatorToken = file.getPrevTokenWhich(
                    file.getFirstNodeToken(expression),
                    'punctuator',
                    operator
                );
                var nextToken = file.getNextToken(operatorToken);
                var prevToken = file.getPrevToken(operatorToken);

                if (_this._noSpaceBefore[operator]) {
                    assert.noSpaceBetween(
                        prevToken,
                        operatorToken,
                        'Operator ' + node.operator + ' should stick to previous expression'
                    );
                }
                if (_this._spaceBefore[operator]) {
                    assert.spaceBetween(
                        prevToken,
                        operatorToken,
                        'Operator ' + node.operator + ' should not stick to previous expression'
                    );
                }
                if (_this._noSpaceAfter[operator]) {
                    assert.noSpaceBetween(
                        operatorToken,
                        nextToken,
                        'Operator ' + node.operator + ' should stick to following expression'
                    );
                }
                if (_this._spaceAfter[operator]) {
                    assert.spaceBetween(
                        operatorToken,
                        nextToken,
                        'Operator ' + node.operator + ' should not stick to following expression'
                    );
                }
            }
        );
    }

};

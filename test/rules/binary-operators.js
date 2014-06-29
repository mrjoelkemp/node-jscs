var Checker = require('../../lib/checker');
var assert = require('assert');
var operators = require('../../lib/utils').binaryOperators.filter(function (op) {
    return op !== ',' && op !== ':';
});

describe('rules/binary-operators', function() {
    var checker;

    beforeEach(function() {
        checker = new Checker();
        checker.registerDefaultRules();
    });

    operators.forEach(function(operator) {
        if (operator === ':') {
            return;
        }

        var sticked = 'var test; test' + operator + '2';
        var stickedWithParenthesis = 'var test; (test)' + operator + '(2)';

        var notSticked = 'var test; test ' + operator + ' 2';
        var notStickedWithParenthesis = 'var test; (test) ' + operator + ' (2)';

        var wrapped = 'var test; test\n' + operator + '\n2';

        [[operator], true].forEach(function(value) {
            it('should not report for ' + sticked + ' with {noSpaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceAfter: value }});
                    assert(checker.checkString(sticked).isEmpty());
                }
            );
            it('should report for ' + notSticked + ' with {noSpaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceAfter: value }});
                    assert(checker.checkString(notSticked).getErrorCount() === 1);
                }
            );
            it('should not report for ' + stickedWithParenthesis + ' with {noSpaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceAfter: value }});
                    assert(checker.checkString(stickedWithParenthesis).isEmpty());
                }
            );
            it('should not report for ' + wrapped + ' with {noSpaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceAfter: value }});
                    assert(checker.checkString(wrapped).isEmpty());
                }
            );
            it('should report for ' + notStickedWithParenthesis + ' with {noSpaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceAfter: value }});
                    assert(checker.checkString(notStickedWithParenthesis).getErrorCount() === 1);
                }
            );

            it('should not report for ' + sticked + ' with {noSpaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceBefore: value }});
                    assert(checker.checkString(sticked).isEmpty());
                }
            );
            it('should report for ' + notSticked + ' with {noSpaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceBefore: value }});
                    assert(checker.checkString(notSticked).getErrorCount() === 1);
                }
            );
            it('should not report for ' + stickedWithParenthesis + ' with {noSpaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceBefore: value }});
                    assert(checker.checkString(stickedWithParenthesis).isEmpty());
                }
            );
            it('should not report for ' + wrapped + ' with {noSpaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceBefore: value }});
                    assert(checker.checkString(wrapped).isEmpty());
                }
            );
            it('should report for ' + notStickedWithParenthesis + ' with {noSpaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { noSpaceBefore: value }});
                    assert(checker.checkString(notStickedWithParenthesis).getErrorCount() === 1);
                }
            );

            it('should report for ' + sticked + ' with {spaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceAfter: value }});
                    assert(checker.checkString(sticked).getErrorCount() === 1);
                }
            );
            it('should not report for ' + notSticked + ' with {spaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceAfter: value }});
                    assert(checker.checkString(notSticked).isEmpty());
                }
            );
            it('should report for ' + stickedWithParenthesis + ' with {spaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceAfter: value }});
                    assert(checker.checkString(stickedWithParenthesis).getErrorCount() === 1);
                }
            );
            it('should not report for ' + notStickedWithParenthesis + ' with {spaceAfter: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceAfter: value }});
                    assert(checker.checkString(notStickedWithParenthesis).isEmpty());
                }
            );

            it('should report for ' + sticked + ' with {spaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceBefore: value }});
                    assert(checker.checkString(sticked).getErrorCount() === 1);
                }
            );
            it('should not report for ' + notSticked + ' with {spaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceBefore: value }});
                    assert(checker.checkString(notSticked).isEmpty());
                }
            );
            it('should report for ' + stickedWithParenthesis + ' with {spaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceBefore: value }});
                    assert(checker.checkString(stickedWithParenthesis).getErrorCount() === 1);
                }
            );
            it('should not report for ' + notStickedWithParenthesis + ' with {spaceBefore: ' + value + '} option',
                function() {
                    checker.configure({ binaryOperators: { spaceBefore: value }});
                    assert(checker.checkString(notStickedWithParenthesis).isEmpty());
                }
            );
        });
    });

    it('should not report assignment operator for "a = b" without option', function() {
        checker.configure({ binaryOperators: { noSpaceAfter: [','] }});
        assert(checker.checkString('a = b').isEmpty());
    });
    it('should report for assignment expression', function() {
        checker.configure({ binaryOperators: { noSpaceAfter: ['='] }});
        assert(checker.checkString('x = 1').getErrorCount() === 1);
    });
    it('should report for assignment expressions', function() {
        checker.configure({ binaryOperators: { noSpaceAfter: ['='] }});
        assert(checker.checkString('var x = 1, t = 2').getErrorCount() === 2);
    });
    it('should not report for assignment expressions if "=" is not specified', function() {
        checker.configure({ binaryOperators: { noSpaceAfter: [','] }});
        assert(checker.checkString('var x = 1;').isEmpty());
    });
    it('should not report empty assignment expression', function() {
        checker.configure({ binaryOperators: { noSpaceAfter: ['='] }});
        assert(checker.checkString('var x').isEmpty());
    });
});

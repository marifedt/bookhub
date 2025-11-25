import { capitalizeWords, formatDate } from '../utils.js';

describe('Utility Functions', () => {
    describe('capitalizeWords', () => {
        test('should capitalize the first letter of each word', () => {
            const input = 'hello world';
            const output = capitalizeWords(input);
            expect(output).toBe('Hello World');
        });

        test('should handle single words', () => {
            const input = 'bookhub';
            const output = capitalizeWords(input);
            expect(output).toBe('Bookhub');
        });

        test('should handle empty strings', () => {
            const input = '';
            const output = capitalizeWords(input);
            expect(output).toBe('');
        });
    });

    describe('formatDate', () => {
        test('should format a valid date string', () => {
            const input = '2023-10-05T12:00:00';
            const output = formatDate(input);
            expect(output).toBe('October 5, 2023');
        });

        test('should handle null or undefined', () => {
            expect(formatDate(null)).toBe('Unknown Date');
            expect(formatDate(undefined)).toBe('Unknown Date');
        });
    });

});

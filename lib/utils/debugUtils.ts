/**
 * Debug utility to monitor formatting issues
 */

export class FormattingDebugger {
    private static instance: FormattingDebugger;
    private issues: Array<{ text: string, issue: string }> = [];

    private constructor() { }

    static getInstance(): FormattingDebugger {
        if (!FormattingDebugger.instance) {
            FormattingDebugger.instance = new FormattingDebugger();
        }
        return FormattingDebugger.instance;
    }

    logIssue(text: string, cleaned: string) {
        const issues = this.detectIssues(text, cleaned);
        if (issues.length > 0) {
            this.issues.push({
                text: text.substring(0, 100) + '...',
                issue: issues.join(', ')
            });
            console.warn('Formatting issues detected:', issues);
        }
    }

    private detectIssues(original: string, cleaned: string): string[] {
        const issues: string[] = [];

        if (original.includes('#') && cleaned.includes('#')) {
            issues.push('Headers not cleaned');
        }
        if (original.includes('*') && cleaned.includes('*')) {
            issues.push('Bold/italic not cleaned');
        }
        if (original.includes('`') && cleaned.includes('`')) {
            issues.push('Code blocks not cleaned');
        }

        return issues;
    }

    getIssues() {
        return this.issues;
    }

    clearIssues() {
        this.issues = [];
    }
}

// Usage in API route or component
export const formattingDebugger = FormattingDebugger.getInstance();
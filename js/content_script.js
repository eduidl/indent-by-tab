'use stcict';

(function() {
    function start_and_end_line_num(lines, start, end) {
        if (start > end) return null;
        let start_pos;
        for (const [i, line] of lines.entries()) {
            if (start_pos === undefined && start <= line.length) {
                start_pos = [i, start];
            }
            if (end <= line.length + 1) {
                return [start_pos, [i, end]];
            }
            start -= line.length + 1;
            end -= line.length + 1;
        }
    }

    const indent_size = 2;
    const blanks = new Array(indent_size).fill(' ').join('');
    let shift_flag = false;

    let textareas = document.getElementsByTagName('textarea');
    for (const textarea of textareas) {
        textarea.addEventListener('keydown', function(e) {
            if (e.keyCode !== 9) return;
            e.preventDefault();
            const sentence = this.value;
            const selection_start = this.selectionStart;
            const selection_end = this.selectionEnd;
            if (!e.shiftKey && selection_start == selection_end) {
                let len = sentence.length;

                this.value = sentence.substr(0, selection_start) + blanks  + sentence.substr(selection_start, len);
                this.selectionStart = selection_start + indent_size;
                this.selectionEnd = selection_start + indent_size;
                return
            }
            const lines = sentence.split("\n");
            let start_pos, end_pos;
            [start_pos, end_pos] = start_and_end_line_num(lines, selection_start, selection_end);
            if (e.shiftKey) {
                let start_deleted_blank_size, end_deleted_blank_size;
                let other_deleted_blank_size = 0;
                const re = new RegExp(`\^\\s{0,${indent_size}}`);
                this.value = lines.map(function(line, i) {
                    if (start_pos[0] <= i && i <= end_pos[0]) {
                        let match = line.match(re);
                        switch (i) {
                            case start_pos[0]:
                                start_deleted_blank_size = match[0].length;
                                break;
                            case end_pos[0]:
                                end_deleted_blank_size = match[0].length;
                                break;
                            default:
                                other_deleted_blank_size += match[0].length;
                        }
                        return line.replace(re, '');
                    } else {
                        return line;
                    }
                }).join("\n");
                this.selectionStart = selection_start - Math.min(start_pos[1], start_deleted_blank_size);
                if (start_pos[0] === end_pos[0]) {
                    this.selectionEnd = selection_end - other_deleted_blank_size - Math.min(end_pos[1], start_deleted_blank_size);
                } else {
                    this.selectionEnd = selection_end - start_deleted_blank_size - other_deleted_blank_size - Math.min(end_pos[1], end_deleted_blank_size);
                }
                ;
            } else {
                this.value = lines.map(function(line, i) {
                    return (start_pos[0] <= i && i <= end_pos[0]) ? blanks + line : line;
                }).join("\n");
                this.selectionStart = selection_start + indent_size;
                this.selectionEnd = selection_end + indent_size * (end_pos[0] - start_pos[0] + 1);
            }
        });
    }
})();

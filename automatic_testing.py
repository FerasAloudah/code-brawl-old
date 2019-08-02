import os
import sys
import filecmp
import re
import subprocess
from subprocess import CalledProcessError, TimeoutExpired
from globals import PROBLEMS

LANGUAGES = [
    'c',
    'cpp',
    'java',
    'js',
    'py',
]

STATUS_CODES = {
    200: 'OK',
    201: 'ACCEPTED',
    400: 'WRONG ANSWER',
    401: 'COMPILATION ERROR',
    402: 'RUNTIME ERROR',
    403: 'INVALID FILE',
    404: 'FILE NOT FOUND',
    408: 'TIME LIMIT EXCEEDED'
}


def get_last_line(file_name):
    last_line = ''
    with open(file_name) as file:
        for line in file:
            last_line = line.strip()
    return last_line


def get_file_lines(file_name):
    lines = []
    with open(file_name) as file:
        for line in file:
            lines.append(line.strip())
    return lines


class Program:
    def __init__(self, file_name, input_file, timeout, expected_output_file):
        self.file_name = file_name                        # Full name of the source code file
        self.language = None                              # Language
        self.name = None                                  # File name without extension
        self.input_file = input_file                      # Input file
        self.input_lines = []
        self.expected_output_file = expected_output_file  # Expected output file
        self.actual_output_file = "output.txt"            # Actual output file
        self.timeout = timeout                            # Time limit set for execution in seconds

    def is_valid_file(self):
        languages = '|'
        validfile = re.compile(f'^(\S+)\.({languages.join(LANGUAGES)})$')
        matches = validfile.match(self.file_name)

        if matches:
            self.name, self.language = matches.groups()
            return True

        return False

    def compile(self):
        # Remove previous executables
        if os.path.isfile(self.name):
            os.remove(self.name)

        # Check if files are present
        if not os.path.isfile(self.file_name):
            return 404, 'Missing file'

        # Check language
        command = None
        if self.language == 'c':
            command = f'gcc -o {self.name} {self.file_name}'
        elif self.language == 'cpp':
            command = f'g++ -o {self.name} {self.file_name}'
        elif self.language == 'java':
            command = f'javac {self.file_name}'

        # Invalid files
        if command is None:
            return 403, 'File is of invalid type'

        try:
            proc = subprocess.run(
                command.split(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True
            )

            # Check for errors
            if proc.returncode != 0:
                return 401, proc.stderr
            else:
                return 200, None

        except CalledProcessError as e:
            print(e.output)

    def run(self, input=None):
        # Check if files are present
        if not os.path.isfile(self.file_name):
            return 404, 'Missing executable file'

        # Check language
        command = None
        if self.language in ['c', 'cpp']:
            command = self.name
        elif self.language == 'java':
            command = f'java {self.name}'
        elif self.language == 'js':
            command = f'node {self.file_name}'
        elif self.language == 'py':
            command = f'python {self.file_name}'

        # Invalid files
        if command is None:
            return 403, 'File is of invalid type'

        try:
            # TODO: Split output files for each input.
            with open('output.txt', 'w') as fout:
                proc = subprocess.run(
                    command.split(),
                    input=input,
                    stdout=fout,
                    stderr=subprocess.PIPE,
                    timeout=self.timeout,
                    universal_newlines=True
                )

            # Check for errors
            if proc.returncode != 0:
                return 402, proc.stderr
            else:
                return 200, None

        except TimeoutExpired as tle:
            return 408, tle
        except CalledProcessError as e:
            print(e.output)

        # Perform cleanup
        if self.language in ['c', 'cpp']:
            os.remove(self.name)
        elif self.language == 'java':
            os.remove(f'{self.name}.class')

    def evaluate(self, output):
        # TODO: Add spaces before running actual program.
        # TODO: Evaluate each line of input.
        # TODO: Return 201 after all lines of input have been passed.
        # TODO: Else return the last line the program executed with the user's output.
        if os.path.isfile(self.actual_output_file) and os.path.isfile(self.expected_output_file):
            actual_output = get_last_line(self.actual_output_file)

            print(f'Actual Output: {actual_output}')
            print(f'Expected Output: {output}')

            if actual_output == output:
                return 201, None
            else:
                # TODO: return input with the expected output.
                return 400, None
        else:
            return 404, 'Missing output files'


def evaluate(file_name, input_file=None, expected_output_file=None, timeout=1):
    prog = Program(
        file_name=file_name,
        input_file=input_file,
        timeout=timeout,
        expected_output_file=expected_output_file
    )

    if not prog.is_valid_file():
        print('FATAL: Invalid file', file=sys.stderr)
        return 404, STATUS_CODES[404], None, None, None

    print('Executing code checker...')

    # Compile the program
    if prog.language not in ['py', 'js']:
        compileResult, compileErrors = prog.compile()
        print(f'Compiling... {STATUS_CODES[compileResult]}({compileResult})', flush=True)

        if compileErrors is not None:
            sys.stdout.flush()
            print(compileErrors, file=sys.stderr)
            return compileResult, STATUS_CODES[compileResult], compileErrors, None, None

    # Get input lines.
    input_lines = get_file_lines(input_file)
    output_lines = get_file_lines(expected_output_file)

    # Run the program
    for i, (input, output) in enumerate(zip(input_lines, output_lines)):
        print(f'\nRunning Test Case #{i+1}:')

        runtimeResult, runtimeErrors = prog.run(input)
        print(f'Running... {STATUS_CODES[runtimeResult]}({runtimeResult})', flush=True)
        if runtimeErrors is not  None:
            sys.stdout.flush()
            print(runtimeErrors, file=sys.stderr)
            return runtimeResult, STATUS_CODES[runtimeResult], runtimeErrors, None, None

        # Match expected output
        matchResult, matchErrors = prog.evaluate(output)
        print(f'{STATUS_CODES[matchResult]}', flush=True)

        if matchErrors is not None:
            sys.stdout.flush()
            print(matchErrors, file=sys.stderr)
            return matchResult, STATUS_CODES[matchResult], matchErrors, None, None
        elif matchResult == 400:
            return matchResult, STATUS_CODES[matchResult], None, input, output

    return matchResult, STATUS_CODES[matchResult], None, None, None


def submit(file_name, data, slug):
    input_file = 'input.txt' # f'./problems/{slug}/input.txt'
    expected_output_file = 'expectedoutput.txt' # f'./problems/{slug}/expected_output_file.txt'

    if not os.path.exists(os.path.dirname(file_name)):
        try:
            os.makedirs(os.path.dirname(file_name))
        except OSError as exc: # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    with open(file_name, 'w+') as file:
        file.write(data)

    status_code, status_message, console_output, last_input, last_output = evaluate(
        file_name=file_name,
        input_file=input_file,
        expected_output_file=expected_output_file,
        timeout=15
    )

    data = {
        'status_code': status_code,
        'status_message': status_message,
        'console_output': console_output,
        'last_input': last_input,
        'last_output': last_output
    }

    return data


if __name__ == '__main__':
    status_code, status_message, console_output, last_input, last_output = evaluate(
        file_name='test.py',
        input_file='input.txt',
        expected_output_file='expectedoutput.txt',
        timeout=10,
    )

    print("\nMethod's output:")
    print(status_code)
    print(status_message)
    print(console_output)
    print(last_input)
    print(last_output)

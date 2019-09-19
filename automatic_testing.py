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


def get_test_cases(folder_name, file_name):
    test_cases = []

    for i in range(1, 11):
        test_case_file = f'{folder_name}/{i}/{file_name}'
        test_cases.append(get_file_lines(test_case_file))

    return test_cases


class Program:
    def __init__(self, file_name, input_file, output_file, stdout_file, timeout, expected_output_file):
        self.file_name = file_name                        # Full name of the source code file
        self.language = None                              # Language
        self.name = None                                  # File name without extension
        self.input_file = input_file                      # Input file
        self.input_lines = []
        self.expected_output_file = expected_output_file  # Expected output file
        self.actual_output_file = output_file             # Actual output file
        self.stdout_file = stdout_file
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
            input = self.actual_output_file + '\n' + '\n'.join(input)
            with open(self.stdout_file, 'w+') as fout:
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
        stdout = None
        if os.path.isfile(self.stdout_file):
            stdout = get_file_lines(self.stdout_file)

        if os.path.isfile(self.actual_output_file):
            actual_output = get_last_line(self.actual_output_file)

            print(f'Actual Output: {actual_output}')
            print(f'Expected Output: {output}')

            if actual_output == output:
                return 201, None, actual_output, stdout
            else:
                # TODO: return input with the expected output.
                return 400, None, actual_output, stdout
        else:
            return 404, 'Missing output files', None, None


def evaluate(file_name, input_file=None, output_file=None, stdout_file=None, expected_output_file=None, timeout=1, folder_location=None):
    prog = Program(
        file_name=file_name,
        input_file=input_file,
        output_file=output_file,
        stdout_file=stdout_file,
        timeout=timeout,
        expected_output_file=expected_output_file
    )

    if not prog.is_valid_file():
        print('FATAL: Invalid file', file=sys.stderr)
        return 404, STATUS_CODES[404], None, None, None, None, None

    print('Executing code checker...')

    # Compile the program
    if prog.language not in ['py', 'js']:
        compile_result, compile_errors = prog.compile()
        print(f'Compiling... {STATUS_CODES[compile_result]}({compile_result})', flush=True)

        if compile_errors is not None:
            sys.stdout.flush()
            print(compile_errors, file=sys.stderr)
            return compile_result, STATUS_CODES[compile_result], compile_errors, None, None, None, None

    # Get input lines.
    input_lines = get_test_cases(folder_location, 'input.txt') # get_file_lines(input_file)
    output_lines = get_test_cases(folder_location, 'expected_output_file.txt') # get_file_lines(expected_output_file)

    # Run the program.
    for i, (input, output) in enumerate(zip(input_lines, output_lines)):
        print(f'\nRunning Test Case #{i+1}:')
        runtime_results, runtime_errors = prog.run(input)
        print(f'Running... {STATUS_CODES[runtime_results]}({runtime_results})', flush=True)
        if runtime_errors is not  None:
            sys.stdout.flush()
            print(runtime_errors, file=sys.stderr)
            return runtime_results, STATUS_CODES[runtime_results], runtime_errors, None, None, None, None

        # Match expected output
        match_result, match_errors, last_output, stdout = prog.evaluate(output)
        print(f'{STATUS_CODES[match_result]}', flush=True)

        if match_errors is not None:
            sys.stdout.flush()
            print(match_errors, file=sys.stderr)
            return match_result, STATUS_CODES[match_result], match_errors, None, None, None, None
        elif match_result == 400:
            return match_result, STATUS_CODES[match_result], None, input, output, last_output, stdout

    return match_result, STATUS_CODES[match_result], None, None, None, None, None


def submit(dir_name, file_name, data, slug):
    input_file = f'./problems/{slug}' # 'input.txt' # f'./problems/{slug}/input.txt'
    expected_output_file = f'./problems/{slug}' # 'expectedoutput.txt' # f'./problems/{slug}/expected_output_file.txt'
    folder_location =  f'./problems/{slug}'
    full_name = f'{dir_name}/{file_name}'

    if not os.path.exists(os.path.dirname(full_name)):
        try:
            os.makedirs(os.path.dirname(full_name))
        except OSError as exc: # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    with open(full_name, 'w+') as file:
        file.write(data)

    status_code, status_message, console_output, last_input, last_expected_output, last_output, stdout = evaluate(
        file_name=full_name,
        input_file=input_file,
        output_file=f'{dir_name}/output.txt',
        stdout_file=f'{dir_name}/stdout.txt',
        expected_output_file=expected_output_file,
        timeout=15,
        folder_location=folder_location
    )

    data = {
        'status_code': status_code,
        'status_message': status_message,
        'console_output': console_output,
        'last_input': last_input,
        'last_expected_output': last_expected_output,
        'last_output': last_output,
        'stdout': stdout
    }

    return data


if __name__ == '__main__':
    status_code, status_message, console_output, last_input, last_expected_output, last_output, stdout = evaluate(
        file_name='test.py',
        input_file='input.txt',
        output_file='output.txt',
        stdout_file='stdout.txt',
        expected_output_file='expectedoutput.txt',
        timeout=15
    )

    print("\nMethod's output:")
    print(status_code)
    print(status_message)
    print(console_output)
    print(last_input)
    print(last_expected_output)
    print(last_output)
    print(stdout)

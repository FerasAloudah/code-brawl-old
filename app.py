from flask import Flask, request, session, render_template, url_for, request, redirect
from flask_restful import Resource, Api
from flask_jsglue import JSGlue
from automatic_testing import submit
from globals import PROBLEMS
from api.firebase import get_problems
import json

app = Flask(__name__)
api = Api(app)
jsglue = JSGlue(app)

EXTENSIONS = {
    'java': '.java',
    'python': '.py'
}


@app.route('/')
def home():
    return render_template('main.html')


@app.route('/c/')
@app.route('/c/<path:challenge_id>/')
def challenge(challenge_id=None):
    if not challenge_id:
        return redirect(url_for('home'))

    problems = get_problems(challenge_id)

    if not problems:
        return redirect(url_for('home'))

    data = []
    for problem in problems:
        slug = PROBLEMS[problem]
        with open(f'./problems/{slug}/{slug}.json') as json_file:
            data.append(json.load(json_file))

    # And then pull all the problems data from the document at once.
    return render_template('challenge.html',
        challenge_id=challenge_id,
        first_description=data[0]['description'],
        first_java_code=data[0]['java'],
        first_python_code=data[0]['python'],
        second_description=data[1]['description'],
        second_java_code=data[1]['java'],
        second_python_code=data[1]['python'],
        third_description=data[2]['description'],
        third_java_code=data[2]['java'],
        third_python_code=data[2]['python'],
    )


@app.route('/leaderboard/')
def leaderboard():
    return redirect(url_for('home'))


class CodeBrawl(Resource):
    def get(self):
        return None

    def post(self):
        json = request.get_json()
        slug = PROBLEMS[json.get('problem')]
        extension = EXTENSIONS[json.get('language')]
        player = json.get('player')
        file_name = f'{player}{extension}'
        dir_name = f'./problems/{slug}/{player}'

        # TODO: maybe add a way for the user to retrieve his latest submission.
        # TODO: create a directory for the user on submitted problem folder.
        # with open(file_name, 'w+') as file:
        #     file.write(json.get('data'))


        # TODO: change 'input.txt' and 'expectedoutput.txt' + combine user's input with a master run class.
        # a master run class is a class used to run all files, and gives their output.

        # status_code, status_message, console_output, last_input, last_output = evaluate(file_name,
        #     input_file='input.txt',
        #     expected_output_file='expectedoutput.txt',
        #     timeout=10
        # )
        #
        # data = {
        #     'status_code': 201,
        #     'status_message': status_message,
        #     'console_output': console_output,
        #     'last_input': last_input,
        #     'last_output': last_output
        # }

        data = submit(dir_name, file_name, json.get('data'), slug)

        return data

api.add_resource(CodeBrawl, '/code-brawl')

if __name__ == '__main__':
    app.run(debug=True)

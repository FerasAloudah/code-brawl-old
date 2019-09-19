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

    return render_template('challenge.html', challenge_id=challenge_id, data=data)


@app.route('/leaderboard/')
def leaderboard():
    return render_template('leaderboard.html')


@app.route('/r/')
@app.route('/r/<path:challenge_id>')
def result(challenge_id=None):
    if not challenge_id:
        return redirect(url_for('home'))

    return render_template('result.html', challenge_id=challenge_id)


@app.route('/e/')
@app.route('/e/<int:error_code>')
def error(error_code=404):
    return render_template('error.html')


class CodeBrawl(Resource):
    def get(self):
        return None

    def post(self):
        json_data = request.get_json()
        slug = PROBLEMS[json_data.get('problem')]
        extension = EXTENSIONS[json_data.get('language')]
        player = json_data.get('player')
        file_name = f'{player}{extension}'
        dir_name = f'./problems/{slug}/{player}'

        # TODO: maybe add a way for the user to retrieve his latest submission.
        # TODO: create a directory for the user on submitted problem folder.
        # TODO: change 'input.txt' and 'expectedoutput.txt' + combine user's input with a master run class.
        # a master run class is a class used to run all files, and gives their output.

        data = submit(dir_name, file_name, json_data.get('data'), slug)

        return data

class ProblemEditor(Resource):
    def get(self):
        return None

    def post(self):
        json_data = request.get_json()
        slug = PROBLEMS[json_data.get('problem')]
        file_name = f'./problems/{slug}/{slug}.json'

        with open(file_name) as json_file:
            json_data_original = json.load(json_file)

        json_data_original['java'] = json_data['java']
        json_data_original['python'] = json_data['python']

        with open(f'{slug}.json', 'w+') as outfile:
            json.dump(json_data_original, outfile)

        return json_data_original

api.add_resource(CodeBrawl, '/code-brawl')
api.add_resource(ProblemEditor, '/problem-editor')

if __name__ == '__main__':
    app.run(debug=True)

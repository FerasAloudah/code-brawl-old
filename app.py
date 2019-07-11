from flask import Flask, request, session, render_template, url_for, request, redirect
from flask_restful import Resource, Api
from flask_jsglue import JSGlue

app = Flask(__name__)
api = Api(app)
jsglue = JSGlue(app)


@app.route('/')
def home():
    return render_template('main.html')


@app.route('/match/')
@app.route('/match/<path:match_id>/', methods=['GET', 'POST'])
def challenge(match_id=None):
    if not match_id:
        return redirect(url_for('home'))

    if request.method == 'POST':
        return render_template('challenge.html', match_id=match_id, player_id=request.form['player'])

    # Change to loading.html later
    return render_template('challenge.html', match_id=match_id)


@app.route('/leaderboard/')
def leaderboard():
    pass


class CodeBrawl(Resource):
    def get(self):
        return None

    def post(self):
        json = request.get_json()
        extension = '.java' if json.get('language') == 'java' else '.py'
        fileName = json.get('player') + extension
        with open(fileName, 'w+') as file:
            file.write(json.get('data'))

        return json, 201

api.add_resource(CodeBrawl, '/code-brawl')

if __name__ == '__main__':
    app.run(debug=True)

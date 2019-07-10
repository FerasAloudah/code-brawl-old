from flask import Flask, request, session, render_template, url_for, request, redirect
from flask_restful import Resource, Api
from flask_jsglue import JSGlue

app = Flask(__name__)
api = Api(app)
jsglue = JSGlue(app)


@app.route('/')
def home():
    return render_template('main.html')


@app.route('/challenge/')
@app.route('/challenge/<path:match_id>/')
def challenge(match_id=None):
    if not match_id:
        return redirect(url_for('home'))

    return render_template('challenge.html', match_id=match_id)


@app.route('/match/<path:match_id>/', methods=['GET', 'POST'])
def match(match_id):
    if request.method == 'POST':
        session[match_id] = request.form['host']
        return render_template('match.html', id=match_id)
    elif session[match_id]:
        return render_template('match.html', id=match_id)
    else:
        return render_template('no_match.html')


@app.route('/leaderboard/')
def leaderboard():
    pass


class CodeBrawl(Resource):
    def get(self):
        return None

    def post(self):
        json = request.get_json()
        print(json.get('name'))
        return json, 201

api.add_resource(CodeBrawl, '/code-brawl')

if __name__ == '__main__':
    app.run(debug=True)

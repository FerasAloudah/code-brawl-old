from flask import Flask, request
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

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

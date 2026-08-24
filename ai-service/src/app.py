from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    return jsonify({'message': 'AI Legal Assistant response'})

@app.route('/api/ai/court', methods=['POST'])
def court():
    return jsonify({'message': 'Virtual court simulated'})

if __name__ == '__main__':
    app.run(port=5000)

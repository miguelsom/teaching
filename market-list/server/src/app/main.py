from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# CORS liberado para desenvolvimento
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

# armazenamento simples em memória para demo
# troque por sua persistência real se necessário
produtos = []

def _parse_float(v):
    if v is None:
        return 0.0
    s = str(v).replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return 0.0

@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok"}), 200

@app.route("/produtos", methods=["GET", "OPTIONS"])
def listar_produtos():
    if request.method == "OPTIONS":
        return ("", 204)
    return jsonify({"produtos": produtos}), 200

@app.route("/produto", methods=["POST", "PUT", "DELETE", "OPTIONS"])
def criar_atualizar_deletar_produto():
    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        quantidade = int(request.form.get("quantidade", "0"))
        valor = _parse_float(request.form.get("valor"))
        if not nome:
            return jsonify({"mensagem": "Nome é obrigatório"}), 400
        # impede duplicado simples por nome
        if any(p["nome"] == nome for p in produtos):
            return jsonify({"mensagem": "Produto já existe"}), 400
        produtos.append({"nome": nome, "quantidade": quantidade, "valor": valor})
        return jsonify({"mensagem": "Criado com sucesso"}), 201

    if request.method == "PUT":
        nome_original = request.args.get("nome", "").strip()
        if not nome_original:
            return jsonify({"mensagem": "Parâmetro 'nome' é obrigatório na query"}), 400

        nome = request.form.get("nome", "").strip()
        quantidade = int(request.form.get("quantidade", "0"))
        valor = _parse_float(request.form.get("valor"))

        for p in produtos:
            if p["nome"] == nome_original:
                p["nome"] = nome or p["nome"]
                p["quantidade"] = quantidade
                p["valor"] = valor
                return jsonify({"mensagem": "Atualizado com sucesso"}), 200
        return jsonify({"mensagem": "Produto não encontrado"}), 404

    if request.method == "DELETE":
        nome = request.args.get("nome", "").strip()
        if not nome:
            return jsonify({"mensagem": "Parâmetro 'nome' é obrigatório"}), 400
        for i, p in enumerate(produtos):
            if p["nome"] == nome:
                produtos.pop(i)
                return jsonify({"mensagem": "Deletado com sucesso"}), 200
        return jsonify({"mensagem": "Produto não encontrado"}), 404

    return jsonify({"mensagem": "Método não permitido"}), 405

@app.route("/produto/<string:nome_original>", methods=["PUT", "OPTIONS"])
def atualizar_produto_por_path(nome_original: str):
    if request.method == "OPTIONS":
        return ("", 204)

    nome = request.form.get("nome", "").strip()
    quantidade = int(request.form.get("quantidade", "0"))
    valor = _parse_float(request.form.get("valor"))

    for p in produtos:
        if p["nome"] == nome_original:
            p["nome"] = nome or p["nome"]
            p["quantidade"] = quantidade
            p["valor"] = valor
            return jsonify({"mensagem": "Atualizado com sucesso"}), 200
    return jsonify({"mensagem": "Produto não encontrado"}), 404

if __name__ == "__main__":
    # desenvolvimento local
    app.run(host="127.0.0.1", port=5000, debug=True)

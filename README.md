# 🛒 Sistema de Gestão de Loja

Este projeto consiste no desenvolvimento de um sistema web para controle de loja, voltado para uso interno por vendedores e gerentes. O objetivo é centralizar informações e facilitar o gerenciamento das operações comerciais.

---

## 📌 Funcionalidades

* 👤 Cadastro de vendedores
* 🔐 Login e autenticação de usuários
* 👥 Cadastro e consulta de clientes
* 📦 Cadastro e gerenciamento de produtos
* 💰 Registro de vendas
* 📊 Controle de estoque
* 📜 Histórico de vendas

---

## 🧠 Objetivo do Projeto

O sistema foi desenvolvido com fins acadêmicos, com o intuito de aplicar conceitos de desenvolvimento web, banco de dados e modelagem de sistemas, proporcionando uma solução simples e eficiente para o gerenciamento de uma loja.

---

## 🛠️ Tecnologias Utilizadas

* **Back-end:** Python (Flask)
* **Front-end:** HTML, CSS
* **Banco de Dados:** SQLite
* **Versionamento:** Git e GitHub

---

## 🗄️ Estrutura do Projeto

```
SistemaGestaoLoja/
│
├── app.py
├── banco.db
├── templates/
│   ├── login.html
│   └── cadastro.html
│
└── static/
    └── css/
        └── style.css
```

---

## ▶️ Como Executar o Projeto

1. Clone o repositório:

```
git clone https://github.com/seuusuario/SistemaGestaoLoja.git
```

2. Acesse a pasta do projeto:

```
cd SistemaGestaoLoja
```

3. Instale as dependências:

```
pip install flask werkzeug
```

4. Execute o sistema:

```
python app.py
```

5. Acesse no navegador:

```
http://127.0.0.1:5000/login
```

---

## 🔒 Segurança

* Senhas criptografadas utilizando hash
* Controle de sessão para usuários autenticados
* Acesso restrito apenas a funcionários

---

## 🎨 Interface

O sistema utiliza uma interface simples e intuitiva, com foco na usabilidade, utilizando cores que transmitem confiança e controle ao usuário.

---

## 🚀 Melhorias Futuras

* Dashboard com gráficos de vendas
* Controle de níveis de acesso (gerente/vendedor)
* Exportação de relatórios
* Integração com banco de dados MySQL
* Melhorias visuais e responsividade

---

## 👨‍💻 Desenvolvedores

* Murilo Luiz Inácio de Souza
* Túlio da Silva Costa
* Vinicius Ferreira de Freitas

---

## 📄 Licença

Este projeto é de caráter acadêmico e não possui fins comerciais.

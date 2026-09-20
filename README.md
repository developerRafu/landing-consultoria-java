# Landing Page — Consultoria Dev Java + IA

Landing page estática em dark mode, 100% personalizável via `config.json`. Otimizada para GitHub Pages.

## Personalização

Edite apenas o arquivo [`config.json`](config.json). Não é necessário alterar HTML, CSS ou JS.

### Seções disponíveis

| Chave | Descrição |
|-------|-----------|
| `meta` | Título da página, descrição, favicon, idioma |
| `theme` | Cores (`accentFrom`, `accentTo`, `background`) |
| `brand` | Nome e logo |
| `contacts` | WhatsApp, Instagram, LinkedIn, email |
| `nav` | Menu e CTA do header |
| `hero` | Título, destaque, subtítulo, badges, CTAs, imagem |
| `problem` | Dores e soluções (arrays `pains` e `solutions`) |
| `benefits` | Grid de benefícios |
| `products` | Carrossel de produtos/mentorias |
| `live` | Encontros diários e tópicos |
| `companies` | Empresas (social proof) |
| `reviews` | Avaliações de alunos |
| `faq` | Perguntas frequentes |
| `cta` | CTA final |
| `footer` | Copyright, tagline, redes sociais |

### Desativar uma seção

```json
"reviews": {
  "enabled": false,
  ...
}
```

### Imagens

Coloque arquivos em `assets/img/` e referencie no JSON:

```json
"image": "assets/img/hero.png"
```

Ou use URLs externas:

```json
"image": "https://exemplo.com/foto.jpg"
```

Se `image` ou `avatar` estiver vazio, um placeholder visual é exibido automaticamente.

### Produtos (carrossel)

```json
"products": {
  "enabled": true,
  "title": "A mentoria que vai te aprovar",
  "carousel": {
    "autoplay": false,
    "interval": 5000,
    "showArrows": true,
    "showDots": true
  },
  "items": [
    {
      "name": "Nome do produto",
      "description": "Descrição",
      "price": "R$ 497/mês",
      "image": "",
      "badge": "Mais popular",
      "highlighted": true,
      "features": ["Item 1", "Item 2"],
      "cta": {
        "text": "Quero entrar",
        "link": "whatsapp",
        "whatsappMessage": "Mensagem personalizada"
      }
    }
  ]
}
```

Com apenas 1 produto, setas/dots/autoplay são desativados automaticamente.

### Ícones

Use nomes Lucide no campo `icon`: `bot`, `zap`, `code`, `users`, `briefcase`, `mic`, `video`, `search`, `file-text`, `coffee`, `target`, `message-circle`, `folder-git`, `file-x`, etc.

### Links de CTA

O campo `link` aceita:
- Chave de contato: `"whatsapp"`, `"instagram"`, `"linkedin"`, `"email"`
- URL direta: `"https://..."`

## Deploy no GitHub Pages

1. Crie um repositório no GitHub e faça push do projeto
2. Vá em **Settings → Pages**
3. Em **Source**, selecione branch `main` e pasta `/ (root)`
4. Acesse `https://seu-usuario.github.io/nome-do-repo/`

O arquivo `.nojekyll` na raiz evita problemas com paths.

## Testar localmente

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`

> **Nota:** Use um servidor local. Abrir `index.html` direto no navegador não carrega o `config.json` por restrição CORS.

## Estrutura

```
/
├── index.html
├── config.json
├── .nojekyll
├── README.md
└── assets/
    ├── css/styles.css
    ├── js/
    │   ├── main.js
    │   ├── carousel.js
    │   └── icons.js
    └── img/
```

## Revenda

Para revender esta landing, entregue o repositório com este README. O comprador personaliza tudo editando apenas o `config.json`.

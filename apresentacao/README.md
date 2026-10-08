# Apresentação — Dev: dicas de carreira pra Juninho

Slide deck HTML (paleta Norte4j) para meetups e bate-papos.

## Online (GitHub Pages)

**https://developerrafu.github.io/portfolio/apresentacao/dev-juninho-30-slides.html**

Publicado no repositório [portfolio](https://github.com/developerRafu/portfolio) (GitHub Pages ativo).

## Abrir localmente

```bash
cd apresentacao
python3 -m http.server 8080
```

Acesse: `http://localhost:8080/dev-juninho-30-slides.html`

## Navegação

- **→** / **Espaço**: próximo slide  
- **←**: anterior  
- **F**: tela cheia

## Conteúdo em JSON (replicar outros decks)

Cada apresentação é um arquivo JSON + o mesmo shell HTML/CSS/JS:

| Arquivo | Função |
|---------|--------|
| `dev-juninho-30-slides.json` | **Conteúdo** — um objeto por slide (`type`, `badge`, `title`, listas, links…) |
| `dev-juninho-30-slides.html` | Shell que aponta para esse JSON |
| `deck.html?deck=outro.json` | Shell genérico para qualquer JSON na pasta |
| `assets/slides-renderer.js` | Monta os slides e navegação |
| `assets/slides.css` | Estilo Norte4j |
| `slides-schema.example.json` | Modelo com todos os `type` suportados |

**Tipos de slide:** `cover`, `section`, `grid`, `card`, `open`, `links`.  
**Modifiers opcionais:** `section`, `scroll`, `checklist`, `challenge`, `open`, `links` (classes `slide--*`).

Para uma nova palestra: copie `slides-schema.example.json`, renomeie, edite só o JSON e abra `deck.html?deck=seu-arquivo.json` (ou duplique o `.html` com `data-slides-config="seu-arquivo.json"`).

## Código-fonte

Cópia de desenvolvimento também em [landing-consultoria-java/apresentacao](https://github.com/developerRafu/landing-consultoria-java/tree/main/apresentacao).

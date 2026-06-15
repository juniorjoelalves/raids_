// Substitua o número abaixo pelo seu WhatsApp (com DDD, apenas números)
const WHATSAPP_NUMERO = "5541999999999"; 

let carrinho = JSON.parse(localStorage.getItem('carrinhoRaids')) || [];

document.addEventListener('DOMContentLoaded', () => {
    injetarPainelCarrinho();
    atualizarInterfaceCarrinho();
});

document.addEventListener('click', (e) => {
    const seletorBotoes = '.carinho, .carinho_sobremesas, .carinho_coca, .carinho_kids, .carinho_familia, .carinho_top';
    const botao = e.target.closest(seletorBotoes);
    if (!botao) return;

    e.preventDefault();
    e.stopPropagation();

    let nome = "Item";
    let preco = 0;

    const divCombo = botao.closest('.kids, .familia, .casal, .top');
    if (divCombo) {
        const h2Preco = divCombo.querySelector('h2');
        if (h2Preco) {
            preco = parseFloat(h2Preco.textContent.replace('R$', '').replace('$', '').replace(',', '.').trim());
        }
        let elementoAnterior = divCombo.previousElementSibling;
        while (elementoAnterior) {
            if (elementoAnterior.classList.contains('nome_do_hamburguer')) {
                nome = elementoAnterior.textContent.trim();
                break;
            }
            const buscaNome = elementoAnterior.querySelector('.nome_do_hamburguer');
            if (buscaNome) {
                nome = buscaNome.textContent.trim();
                break;
            }
            elementoAnterior = elementoAnterior.previousElementSibling;
        }
    }

    const divBebida = botao.closest('.coca_lata');
    if (divBebida && preco === 0) {
        const nomesBebida = divBebida.querySelectorAll('.coca_nome');
        if (nomesBebida.length >= 2) {
            nome = nomesBebida[0].textContent.trim();
            const precoTexto = nomesBebida[1].textContent;
            preco = parseFloat(precoTexto.replace('R$', '').replace('$', '').replace(',', '.').trim());
        }
    }

    const divProduto = botao.closest('.produto');
    if (divProduto && preco === 0) {
        const h2Preco = divProduto.querySelector('h2');
        if (h2Preco) {
            preco = parseFloat(h2Preco.textContent.replace('R$', '').replace(',', '.').trim());
        }
        let atual = divProduto;
        while (atual) {
            let irmao = atual.previousElementSibling;
            while (irmao) {
                if (irmao.classList.contains('nome_do_hamburguer')) {
                    nome = irmao.textContent.trim();
                    break;
                }
                const dentro = irmao.querySelector('.nome_do_hamburguer');
                if (dentro) {
                    nome = dentro.textContent.trim();
                    break;
                }
                irmao = irmao.previousElementSibling;
            }
            if (nome !== "Item") break;
            atual = atual.parentElement;
        }
    } 
    
    const divSobremesa = botao.closest('.Sobremesas');
    if (divSobremesa && preco === 0) {
        const h3s = divSobremesa.querySelectorAll('h3');
        if (h3s.length >= 2) {
            nome = h3s[0].textContent.trim();
            preco = parseFloat(h3s[1].textContent.replace('R$', '').replace(',', '.').trim());
        }
    }

    if (preco > 0 && nome !== "Item") {
        adicionarAoCarrinho(nome, preco);
    }
}, true);

function adicionarAoCarrinho(nome, preco) {
    const itemExistente = carrinho.find(item => item.nome === nome);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }
    salvarCarrinho();
    atualizarInterfaceCarrinho();
}

function salvarCarrinho() {
    localStorage.setItem('carrinhoRaids', JSON.stringify(carrinho));
}

function injetarPainelCarrinho() {
    if (document.getElementById('janela-carrinho')) return;
    const painel = document.createElement('div');
    painel.id = 'janela-carrinho';
    painel.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: white; border: 2px solid #333; padding: 15px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0,0,0,0.3); z-index: 9999; width: 280px; font-family: Arial, sans-serif; color: #333; display: block;";
    painel.innerHTML = `
        <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 5px; display: flex; justify-content: space-between;"><span>🛒 Seu Carrinho</span></h3>
        <ul id="lista-itens-carrinho" style="list-style: none; padding: 0; max-height: 140px; overflow-y: auto; margin: 10px 0;"></ul>
        
        <div style="margin: 10px 0;">
            <label for="obs-carrinho" style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">Observações do Pedido:</label>
            <textarea id="obs-carrinho" placeholder="Ex: Sem cebola, ponto da carne, sabor do refri..." style="width: 100%; height: 45px; border: 1px solid #ccc; border-radius: 4px; padding: 5px; font-size: 12px; resize: none; box-sizing: border-box; font-family: Arial, sans-serif;"></textarea>
        </div>

        <div style="font-weight: bold; margin-top: 10px; border-top: 2px solid #eee; padding-top: 10px; display: flex; justify-content: space-between;">
            <span>Total:</span> <span>R$ <span id="valor-total-carrinho">0,00</span></span>
        </div>
        
        <button id="btn-finalizar-pedido" style="margin-top: 10px; width: 100%; background: #25d366; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">Finalizar Pedido (WhatsApp)</button>
        <button id="btn-limpar-carrinho" style="margin-top: 5px; width: 100%; background: #ff4d4d; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer; font-size: 12px;">Limpar Carrinho</button>
    `;
    document.body.appendChild(painel);

    const txtObs = document.getElementById('obs-carrinho');
    txtObs.value = localStorage.getItem('obsRaids') || '';
    txtObs.addEventListener('input', (e) => {
        localStorage.setItem('obsRaids', e.target.value);
    });

    document.getElementById('btn-limpar-carrinho').addEventListener('click', () => {
        carrinho = [];
        document.getElementById('obs-carrinho').value = '';
        localStorage.removeItem('obsRaids');
        salvarCarrinho();
        atualizarInterfaceCarrinho();
    });

    document.getElementById('btn-finalizar-pedido').addEventListener('click', finalizarPedido);
}

function atualizarInterfaceCarrinho() {
    const listaHtml = document.getElementById('lista-itens-carrinho');
    const totalHtml = document.getElementById('valor-total-carrinho');
    if (!listaHtml || !totalHtml) return;
    listaHtml.innerHTML = "";
    let valorTotal = 0;
    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        valorTotal += subtotal;
        const li = document.createElement('li');
        li.style.cssText = "margin-bottom: 8px; font-size: 14px; display: flex; justify-content: space-between; border-bottom: 1px dashed #eee; padding-bottom: 4px;";
        li.innerHTML = `<span><strong>${item.quantidade}x</strong> ${item.nome}</span> <span>R$ ${subtotal.toFixed(2).replace('.', ',')}</span>`;
        listaHtml.appendChild(li);
    });
    totalHtml.textContent = valorTotal.toFixed(2).replace('.', ',');
}

function finalizarPedido() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    let textoMensagem = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    let valorTotal = 0;

    carrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        valorTotal += subtotal;
        textoMensagem += `*${item.quantidade}x* ${item.nome} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    const obs = document.getElementById('obs-carrinho').value.trim();
    if (obs) {
        textoMensagem += `\n*Observações:* ${obs}\n`;
    }

    textoMensagem += `\n*Total do Pedido:* R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

    const linkWhatsapp = `https://whatsapp.com{WHATSAPP_NUMERO}&text=${encodeURIComponent(textoMensagem)}`;
    window.open(linkWhatsapp, '_blank');
}

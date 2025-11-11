/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/produtos';
  fetch(url, {
    method: 'get',
  })
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then((data) => {
      (Array.isArray(data?.produtos) ? data.produtos : (Array.isArray(data) ? data : [])).forEach(item => insertList(item.nome, item.quantidade, item.valor))
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Erro ao carregar a lista.');
    });
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList()


/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputProduct, inputQuantity, inputPrice) => {
  const formData = new FormData();
  formData.append('nome', inputProduct);
  formData.append('quantidade', inputQuantity);
  formData.append('valor', inputPrice);

  let url = 'http://127.0.0.1:5000/produto';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(() => {
      alert("Item adicionado!");
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Erro ao adicionar item.');
    });
}

// Criar config.py


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
let __editing = null;

const resetEditState = () => {
  const btn = getSubmitButton();
  if (btn) {
    btn.textContent = "Adicionar";
    btn.onclick = newItem;
    btn.disabled = false;
    btn.setAttribute('type', 'button');
  }
  document.getElementById("newInput").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newPrice").value = "";
  __editing = null;
};

const removeElement = () => {
  let close = document.getElementsByClassName("close");
  // var table = document.getElementById('myTable');
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const nomeItem = div.getElementsByTagName('td')[0].innerHTML
      if (confirm("Você tem certeza?")) {
        if (__editing && __editing.originalName === nomeItem) {
          alert("Item em edição foi removido. Saindo do modo edição.");
          resetEditState();
        }
        div.remove()
        deleteItem(nomeItem)
        alert("Removido!")
      }
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item) => {
  console.log(item)
  let url = 'http://127.0.0.1:5000/produto?nome=' + item;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Erro ao remover item.');
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome, quantidade e valor 
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  if (__editing) {
    alert("Você está editando \"" + __editing.originalName + "\". Conclua a atualização ou cancele antes de adicionar outro item.");
    return;
  }

  let inputProduct = document.getElementById("newInput").value;
  let inputQuantity = document.getElementById("newQuantity").value;
  let inputPrice = document.getElementById("newPrice").value;

  if (inputProduct === '') {
    alert("Escreva o nome de um item!");
  } else if (isNaN(inputQuantity) || isNaN(inputPrice)) {
    alert("Quantidade e valor precisam ser números!");
  } else {
    insertList(inputProduct, inputQuantity, inputPrice)
    postItem(inputProduct, inputQuantity, inputPrice)
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const getSubmitButton = () => {
  return document.getElementById("btnSubmit") ||
         document.querySelector('button[onclick="newItem()"]') ||
         document.querySelector('#form-container button');
};

const insertList = (nameProduct, quantity, price) => {
  var item = [nameProduct, quantity, price]
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButton(row.insertCell(-1))
  document.getElementById("newInput").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newPrice").value = "";
  insertEditButton(row.insertCell(-1), nameProduct, quantity, price, row);
  removeElement()
}

function insertEditButton(cell, name, quantity, price, rowRef) {
  const btn = document.createElement('button');
  btn.textContent = 'Editar';
  btn.onclick = function (e) {
    if (e) e.preventDefault();

    document.getElementById("newInput").value = name;
    document.getElementById("newQuantity").value = quantity;
    document.getElementById("newPrice").value = price;

    const submitBtn = getSubmitButton();
    if (!submitBtn) return;

    submitBtn.setAttribute('type', 'button');
    submitBtn.textContent = "Atualizar";
    submitBtn.disabled = false;
    __editing = { originalName: name, row: rowRef };

    alert('Modo edição: "' + name + '" carregado nos campos.');

    submitBtn.onclick = function (ev) {
      if (ev) ev.preventDefault();
      putItem(__editing.originalName, __editing.row);
    };
  };
  cell.appendChild(btn);
}

const putItem = async (originalName, rowRef) => {
  const updatedName = document.getElementById("newInput").value;
  const updatedQuantity = document.getElementById("newQuantity").value;
  const updatedPriceRaw = document.getElementById("newPrice").value;

  if (updatedName === '' || isNaN(updatedQuantity) || updatedPriceRaw === '') {
    alert("Preencha os campos corretamente para atualizar.");
    return;
  }

  const updatedPrice = String(updatedPriceRaw).replace(',', '.');

  const formData = new FormData();
  formData.append('nome', updatedName);
  formData.append('quantidade', updatedQuantity);
  formData.append('valor', updatedPrice);

  const submitBtn = getSubmitButton();
  if (submitBtn) submitBtn.disabled = true;

  const tryPut = (url) =>
    fetch(url, { method: 'put', body: formData })
      .then(async (response) => {
        let data = null;
        try { data = await response.json(); } catch(_) {}
        if (!response.ok) {
          const msg = (data && (data.mensagem || data.detail || data.error)) ? (data.mensagem || data.detail || data.error) : `Falha ao atualizar (HTTP ${response.status}).`;
          throw new Error(msg);
        }
        return data;
      });

  try {
    try {
      await tryPut(`http://127.0.0.1:5000/produto/${encodeURIComponent(originalName)}`);
    } catch (e1) {
      const errMsg = (e1 && e1.message) ? e1.message : '';
      if (/HTTP 404|HTTP 405/i.test(errMsg)) {
        await tryPut(`http://127.0.0.1:5000/produto?nome=${encodeURIComponent(originalName)}`);
      } else {
        throw e1;
      }
    }

    if (rowRef && rowRef.cells) {
      rowRef.cells[0].textContent = updatedName;
      rowRef.cells[1].textContent = updatedQuantity;
      rowRef.cells[2].textContent = String(parseFloat(updatedPrice));
    }
    alert("Produto atualizado!");
    resetEditState();

  } catch (error) {
    console.error('PUT error:', error);
    alert(error && error.message ? error.message : 'Erro ao atualizar.');
    const btn = getSubmitButton();
    if (btn) btn.disabled = false;

  }
};

/* inicialização mínima */
(() => {
  const btn = getSubmitButton();
  if (btn) {
    btn.setAttribute('type', 'button');
    if (!btn.onclick) btn.onclick = newItem;
  }
})();

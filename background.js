// Variável temporária para armazenar o texto selecionado
let selectedText = '';

// Função para abrir o ServiceNow com os dados selecionados
function openServiceNow() {
  const serviceNowUrl = 'https://equatorialenergia.service-now.com/incident.do?sys_id=-1&sysparm_query=active=true&sysparm_stack=incident_list.do?sysparm_query=active=true';

  // Valida o texto selecionado
  if (!selectedText || selectedText.trim() === '') {
    alert('Por favor, selecione um texto válido.');
    return;
  }

  // Abre uma nova aba com a URL do ServiceNow
  browser.tabs.create({ url: serviceNowUrl }).then((tab) => {
    // Aguarda a página carregar completamente
    const listener = (tabId, changeInfo) => {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        // Remove o listener após a página carregar
        browser.tabs.onUpdated.removeListener(listener);

        // Injeta o script para preencher os campos
        browser.tabs.executeScript(tab.id, {
          code: `(${fillFields.toString()})(${JSON.stringify(selectedText)})`
        });
      }
    };

    // Adiciona o listener para monitorar o carregamento da página
    browser.tabs.onUpdated.addListener(listener);
  });
}

// Função para consultar um chamado no ServiceNow
function consultarChamadoServiceNow(incidentNumber) {
  // Valida o número do incidente
  if (!incidentNumber || incidentNumber.trim() === '') {
    alert('Por favor, selecione um número de incidente válido.');
    return;
  }

  // Monta a URL de busca no ServiceNow
  const serviceNowUrl = `https://equatorialenergia.service-now.com/incident.do?sysparm_query=number=${incidentNumber}`;

  // Abre uma nova aba com a URL de busca
  browser.tabs.create({ url: serviceNowUrl });
}

// Função para preencher os campos no ServiceNow
function fillFields(selectedText) {
  // Função para preencher um campo e disparar eventos
  function fillField(element, value) {
    if (element) {
      // Preenche o campo
      element.value = value;

      // Dispara eventos para garantir que a página processe o valor
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      const keydownEvent = new Event('keydown', { bubbles: true });

      element.dispatchEvent(inputEvent);
      element.dispatchEvent(changeEvent);
      element.dispatchEvent(keydownEvent);
    }
  }

  // Aguarda o carregamento dinâmico dos campos
  const interval = setInterval(() => {
    const descriptionField = document.getElementById('incident.description');
    const workNotesField = document.getElementById('incident.work_notes');

    if (descriptionField && workNotesField) {
      // Preenche o campo "Descrição"
      fillField(descriptionField, selectedText);

      // Copia o valor para o campo "Anotações de trabalho"
      fillField(workNotesField, selectedText);

      // Limpa o intervalo
      clearInterval(interval);
    }
  }, 500); // Verifica a cada 500ms
}

// Adiciona as opções no menu de contexto
browser.contextMenus.create({
  id: 'openServiceNow',
  title: 'Abrir Chamado no ServiceNow',
  contexts: ['selection'] // Disponível apenas quando texto é selecionado
});

browser.contextMenus.create({
  id: 'consultarChamadoServiceNow',
  title: 'Consultar Chamado no ServiceNow',
  contexts: ['selection'] // Disponível apenas quando texto é selecionado
});

// Listener para as opções do menu de contexto
browser.contextMenus.onClicked.addListener((info, tab) => {
  // Armazena o texto selecionado na variável temporária
  selectedText = info.selectionText;

  // Executa a função correspondente ao botão clicado
  if (info.menuItemId === 'openServiceNow') {
    openServiceNow();
  } else if (info.menuItemId === 'consultarChamadoServiceNow') {
    consultarChamadoServiceNow(selectedText);
  }
});
let selectedText = ''; // Variável temporária para armazenar o texto selecionado

// Função para abrir o ServiceNow com os dados selecionados
function openServiceNow() {
  const serviceNowUrl = 'https://equatorialenergia.service-now.com/incident.do?sys_id=-1&sysparm_query=active=true&sysparm_stack=incident_list.do?sysparm_query=active=true';

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

// Adiciona a opção no menu de contexto
browser.contextMenus.create({
  id: 'openServiceNow',
  title: 'Abrir Chamado no ServiceNow',
  contexts: ['selection'] // Disponível apenas quando texto é selecionado
});

// Listener para a opção do menu de contexto
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openServiceNow') {
    // Armazena o texto selecionado na variável temporária
    selectedText = info.selectionText;

    // Abre o ServiceNow diretamente
    openServiceNow();
  }
});
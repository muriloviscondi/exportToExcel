const render = () => {
  const data = getData();
  createTable(data, "table");
};

const getData = () => {
  const data = users.results.map((user) => {
    return {
      id: user.login.uuid,
      user: {
        name: `${user.name.first} ${user.name.last}`,
        gender: user.gender,
        address: user.location.street.name,
        addressNumber: user.location.street.number,
        city: user.location.city,
        state: user.location.state,
        country: user.location.country,
      },
      login: {
        username: user.login.username,
        email: user.email,
        password: user.login.password,
      },
      locaction: {
        latitude: user.location.coordinates.latitude,
        longitude: user.location.coordinates.longitude,
      },
    };
  });

  return data;
};

const createTable = (data, tableId) => {
  const keysObject = getKeys(data);

  const htmlThead = getHeadTable(keysObject);
  const htmlTbody = getBodyTable(data, keysObject);
  const table = getTable(htmlThead, htmlTbody);

  setTable(tableId, table);
  filteredSearch(keysObject);
  setMultiselect(tableId, "state");
};

const getKeys = (data) => {
  const keys = [];
  data.forEach((item, index) => {
    if (index !== 0) {
      return;
    }

    keys.push(...Object.keys(item.user));
  });

  return keys;
};

const getHeadTable = (thead) => {
  let htmlThead = `<thead><tr>`;

  thead.forEach((head) => {
    htmlThead += `
      <th scope="col">
        <span class="title-table">${head}</span>
        <br />
        <input type="text" class="form-control" id="${head}" placeholder="filtrar coluna...">
      </th>
    `;
  });

  htmlThead += `</tr></thead>`;

  return htmlThead;
};

const getBodyTable = (data, keysObject) => {
  let htmlBody = `<tbody>`;

  const newData = data
    .map((item) => {
      return item.user;
    })
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

  newData.forEach((body) => {
    //const user = body.user;
    htmlBody += "<tr class='table-item-generate'>";
    keysObject.forEach((key) => {
      htmlBody += `<td class="${key}">${body[key]}</td>`;
    });

    htmlBody += "</tr>";
  });

  htmlBody += `</tbody>`;

  return htmlBody;
};

const getTable = (htmlThead, htmlTbody) => {
  const html = `
    <table class="table table-hover table-generate">
      ${htmlThead}
      ${htmlTbody}
    </table>
  `;

  return html;
};

const setTable = (tableId, table) => {
  const innerTable = document.querySelector(`#${tableId}`);

  innerTable.innerHTML = table;

  selectRow();
};

const selectRow = () => {
  const rows = document.querySelectorAll(".table-item-generate");

  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const getClass = row.getAttribute("class").split(" ");

      if (getClass.indexOf("active") > 0) {
        row.classList.remove("active");
      } else {
        row.classList.add("active");
      }
    });
  });
};

const exportToExcel = (tableId, tableSelected) => {
  const table = document.querySelector(`#${tableId} table`);
  const rowsActive = table.querySelectorAll(`#${tableId} .active`);

  if (rowsActive.length <= 0) {
    return Swal.fire({
      icon: "info",
      title: "Nenhum item selecionado",
      text: "Selecione algum item para exportar tabela",
      showConfirmButton: false,
      timer: 2500,
    });
  }

  const newTable = document.querySelector(`#${tableSelected}`);

  newTable.innerHTML = "";
  newTable.appendChild(table.cloneNode(true));

  const thead = table.querySelectorAll("th .title-table");
  const theadExcel = newTable.querySelector("thead tr");
  const tbody = newTable.querySelector("tbody");

  theadExcel.innerHTML = "";
  tbody.innerHTML = "";

  thead.forEach((item) => {
    const th = document.createElement("th");

    th.appendChild(item.cloneNode(true));
    theadExcel.appendChild(th);
  });

  rowsActive.forEach((row) => tbody.appendChild(row.cloneNode(true)));

  const vEncodeHead = '<html><head><meta charset="UTF-8"></head><body>';
  const HTML = newTable.innerHTML;

  const blob = new Blob([vEncodeHead + HTML + "</body></html>"], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  saveAs(blob, "Report.xls");
};

const filteredSearch = (inputId) => {
  inputId.forEach((input) => {
    if (input !== "state") {
      const getSearch = document.querySelector(`#${input}`);

      getSearch.addEventListener("input", () => {
        const allDataColumns = document.querySelectorAll(`.${input}`);
        const inputValue = getSearch.value;

        allDataColumns.forEach((item) => {
          const parent = item.closest("tr");

          const itemValue = item.textContent || item.innerText;
          const value = itemValue.normalize("NFD").replace(/[^a-z A-Zs]/g, "");

          const useValue = value !== "" ? value : itemValue;

          if (useValue.toUpperCase().indexOf(inputValue.toUpperCase()) === -1) {
            parent.style.display = "none";
          } else {
            parent.style.display = "table-row";
          }
        });
      });
    }
  });
};

const setMultiselect = (tableId, id) => {
  const getTable = document.querySelector(`#${tableId}`);
  const input = getTable.querySelector(`#${id}`);
  const getAllValues = getTable.querySelectorAll(`.${id}`);

  const getValues = [];

  getAllValues.forEach((value) => getValues.push(value.textContent));

  var optionsValues = getValues
    .filter((item, index) => {
      return getValues.indexOf(item) === index;
    })
    .sort();

  let options = "";

  optionsValues.forEach(
    (option) => (options += `<option value="${option}">${option}</option>`)
  );

  const html = `
      <span class="title-table">state</span>
      <br />
      <select id="${id}" multiple="multiple" hidden>
          ${options}
      </select>
  `;

  const parentElement = input.closest("th");
  parentElement.setAttribute("id", "th-state");
  parentElement.innerHTML = html;

  $(`#${id}`).multiselect({
    enableClickableOptGroups: false,
    enableCollapsibleOptGroups: false,
    maxHeight: "225",
    includeSelectAllOption: true,
    nonSelectedText: "Filtrar coluna...",
  });
  $("a span.caret-container").click();
  var buttonTipos = $(".dropdown-toggle");
  buttonTipos.addClass("form-control required");
};

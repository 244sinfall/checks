import 'bootstrap/dist/css/bootstrap.min.css';
import {useCallback, useEffect, useRef, useState} from "react";
import {InputGroup, PageItem, Pagination, Table} from "react-bootstrap";

const apiLink = process.env["REACT_APP_API_LINK"]

const countMoney = moneyv => {
    if(isNaN(moneyv) || moneyv === 0) return "0 м."
    const money = {gold: 0, silver: 0, copper: 0}
    let moneyRemain = moneyv
    if(moneyRemain > 10000) {
        money.gold = Math.floor(moneyRemain / 10000)
        moneyRemain = moneyRemain % 10000
    }
    if(moneyRemain > 100) {
        money.silver = Math.floor(moneyRemain / 100)
        moneyRemain = moneyRemain % 100
    }
    money.copper = moneyRemain
    let moneyStr = ""
    if(money.gold) moneyStr += `${money.gold} з. `
    if(money.silver) moneyStr += `${money.silver} с. `
    if(money.copper) moneyStr += `${money.copper} м.`
    return moneyStr
}

const countItems = itemsv => {
    if(!itemsv) return ""
    const itemNames = itemsv.map(item => item.name)
    const uniqueItems = [...new Set(itemNames)]
    const uniqueItemsWithAmount = uniqueItems.map(itemName => {
        let count = 0;
        itemsv.forEach((item) => {
            if(item.name === itemName) {
                count += item.count
            }
        })
        return [itemName, count]
    })
    return uniqueItemsWithAmount.map(item => `[${item[0]}]x${item[1]}\n`)
}

const apiCall = async params => {
    let link = apiLink;
    if(!link.endsWith('?')) {
        link+=`?`;
    }
    for(let param in params) {
        if(param) {
            link += `${param}=${params[param]}&`
        }
    }
    const readyLink = link.substring(0, link.length-1);
    const res = await fetch(readyLink);
    return await res.json();
}


function App() {
    const inputTimeout = useRef();
  const [types, setTypes] = useState([]);
  const [count, setCount] = useState();
  const [checks, setChecks] = useState([]);
  const [params, setParams] = useState({
    search: '',
    type: '',
    status: '',
    limit: 50,
    skip: 0
  });
  const onSearch = useCallback((e) => {
      clearTimeout(inputTimeout.current)
      inputTimeout.current = setTimeout(() => {
          setParams({...params, skip: 0, search: e.target.value})
      }, 500)
  }, [params])
  useEffect(() => {
      apiCall(params).then(res => {
          setChecks(res.result);
          setCount(res.count);
          setTypes([...res.types, ''])
      });
  }, [params])
    console.log(count)
  return (
      <>
        <InputGroup>
            <label form='search' className="form-label">Поиск:</label>
            <input id='search' onInput={onSearch}/>
            <select value={params.type} onChange={(sel) => setParams({...params, skip: 0, type: sel.target.value})}>
                {types.map(type => {
                    return <option key={type}>{type}</option>
                })}
            </select>
            <select value={params.status} onChange={(sel) => setParams({...params, skip: 0, status: sel.target.value})}>
                <option></option>
                <option>Ожидает</option>
                <option>Закрыт</option>
                <option>Отказан</option>
            </select>
        </InputGroup>
        <Table style={{maxWidth: "100%", tableLayout: "fixed", wordBreak: "break-all"}} className={"table-striped table-bordered"}>
          <thead>
            <tr>
                <th style={{width: "100px"}} scope="col">ID</th>
                <th scope="col">Дата и время</th>
                <th scope="col">Владелец</th>
                <th scope="col">Тип</th>
                <th scope="col">Название</th>
                <th scope="col">Описание</th>
                <th scope="col">Деньги</th>
                <th scope="col">ГМ</th>
                <th scope="col">Статус</th>
                <th scope="col">Вложения</th>
            </tr>
          </thead>
          <tbody>
          {checks.map(check =>
              <tr key={check.id}>
                  <td style={{width: "100px"}}>{check.id}</td>
                  <td>{check.date}</td>
                  <td>{check.sender}</td>
                  <td>{check.receiver}</td>
                  <td>{check.subject}</td>
                  <td>{check.body}</td>
                  <td>{countMoney(check.money)}</td>
                  <td>{check.gmName}</td>
                  <td>{check.status}</td>
                  <td>{countItems(check.items)}</td>
              </tr>
          )}
          </tbody>
        </Table>
          <Pagination>
              {params.skip > 0 && <PageItem onClick={() => setParams({...params, skip: params.skip - 50})}>Назад</PageItem>}
              {params.skip < count - 50 && <PageItem onClick={() => setParams({...params, skip: params.skip + 50})}>Вперед</PageItem>}
          </Pagination>
      </>
  );
}

export default App;

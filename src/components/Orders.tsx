import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import styled from 'styled-components'
import DeleteIcon from '@mui/icons-material/Delete'

import { auth, database } from '../firebase'
import { Table, CellImg } from './Table'

const Root = styled.div`
  padding: 1em;
`

const adminSelector = store => !!store.claims.admin

const Product = props => {
  const { model } = props
  return (
    <tr className="product" style={{ background: props.darker ? '#eeeeee' : undefined }}>
      <td>
        <Typography title={model.product.comment}>
          {model.product.name} <small>({model.product.category})</small>
        </Typography>
      </td><td>
        <Typography>
          {model.product.unit}
        </Typography>
      </td><td>
        <Typography>
          {model.product.price ? String(model.product.price).replace('.', ',') + 'р.' : '-'}
        </Typography>
      </td><td>
        <Typography>
          x{model.count}
        </Typography>
      </td><td>
        <Typography>
          {String(model.total).replace('.', ',') + 'р.'}
        </Typography>
      </td>
    </tr>
  )
}


const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

import { log, subscribe, useCounter, useSelector, useToggle } from '../utils'
import { useCallback, useEffect, useState } from 'react'

export default () => {
  const [orders, setOrders] = useState({})
  useEffect(() => subscribe(
    database.ref(`orders/${auth.currentUser.uid}`),
    'value',
    snap => setOrders(snap.val() || {})
  ), [])
  const [ordersHistory, setOrdersHistory] = useState({})
  useEffect(() => subscribe(
    database.ref(`ordersHistory/${auth.currentUser.uid}`),
    'value',
    snap => setOrdersHistory(snap.val() || {})
  ), [])
  return <Orders orders={orders} ordersHistory={ordersHistory} />
}

const dateRuConfig = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
} as any

export const Order = ({ order, id }) => {
  const { products, date, total } = order
  const orderedAt = new Date(date).toLocaleString('ru-RU', dateRuConfig)
  return <>
    <tr className="category">
      <td colSpan={100}>
        <Typography variant="h5">
          Заказ от <b>{orderedAt}</b> на сумму <b>{ru.format(total)}</b>
        </Typography>
      </td>
    </tr>
    {Object.entries<any>(products).map(([id, p], i) => <Product
      key={id}
      model={p}
      darker={i % 2}
    />)}
  </>
}

const sortByDate = ([ka, a], [kb, b]) => b.date - a.date

export const Orders = ({ orders = {}, ordersHistory = {} }) => {
  return (
    <Root>
      <Typography variant="h4">Текущие заказы</Typography>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Единица измерения</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(orders).sort(sortByDate).map(([id, order]) =>
            <Order key={id} id={id} order={order} />
          )}
          {!Object.entries(orders).length &&
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">У вас нет текущих заказов</Typography>
            </td></tr>
          }
        </tbody>
      </Table>

      <Typography variant="h4" sx={{ marginTop: '1em' }}>Исполенные заказы</Typography>
      <Table>
        <thead>
          <tr>
            <td><Typography>Наименование</Typography></td>
            <td><Typography>Единица измерения</Typography></td>
            <td><Typography>Цена</Typography></td>
            <td><Typography>Кол-во</Typography></td>
            <td><Typography>Стоимость</Typography></td>
          </tr>
        </thead>
        <tbody>
          {Object.entries<any>(ordersHistory).sort(sortByDate).map(([id, order]) =>
            <Order key={id} id={id} order={order} />
          )}
          {!Object.entries(ordersHistory).length &&
            <tr><td colSpan={100}>
              <Typography variant="h6" align="center">У вас нет исполненных заказов</Typography>
            </td></tr>
          }
        </tbody>
      </Table>
    </Root>
  )
}
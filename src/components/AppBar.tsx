import styled from 'styled-components'

import Paper from '@mui/material/Paper'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'

import LinkIcon from '@mui/icons-material/Link'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

import LogoutIcon from '@mui/icons-material/Logout'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PersonIcon from '@mui/icons-material/Person'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import Badge from '@mui/material/Badge'

import { log, subscribe, useSelector } from '../utils'
import { auth, database, logoutAndReload } from '../firebase'
import { useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'

const AppToolbar = styled(Toolbar)`
  backdrop-filter: blur(8px);
  background: rgba(204, 204, 204, 0.8);
  top: 0;
`

const A = styled.a`
  text-decoration: none;
  color: inherit;
`


const adminSelector = store => !!store.claims.admin

const ru = new Intl.NumberFormat("ru", { style: "currency", currency: "RUB" })

const CartValue = () => {
  const [cart, setCart] = useState({})
  useEffect(() => subscribe(
    database.ref('carts').child(auth.currentUser.uid),
    'value',
    snap => setCart(snap.val() || {})
  ), [])
  const total = Object.values<any>(cart).reduce((acc, v) => acc += v.total, 0)
  return ru.format(total) as any
}

const useProcurement = () => {
  const [orders, setOrders] = useState({})
  useEffect(() => subscribe(
    database.ref('orders'),
    'value',
    snap => setOrders(snap.val() || {})
  ), [])
  let total = 0
  let count = 0
  for (const id in orders)
    for (const id2 in orders[id]) {
      total += orders[id][id2].total
      count++
    }
  return [total, count] as any
}

import { useDispatch } from '../utils'

export default () => {

  const [toggleUserMenuOpen] = useDispatch([
    d => () => d('toggle', 'userMenuOpen')
  ], [])

  const [ordersCount, setOrdersCount] = useState(0)

  useEffect(() => subscribe(
    database.ref('orders').child(auth.currentUser.uid),
    'value',
    snap => setOrdersCount(snap.numChildren())
  ), [])

  const [procurementTotal, procurementOrderCount] = useProcurement()

  const admin = useSelector(adminSelector)

  return (
    <AppBar position="sticky" color="transparent">
      <AppToolbar>
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }} alignItems="center">
          <a href="/">
            <img style={{ cursor: 'pointer', height: 37 }} src="logo.jpg" />
          </a>
          <Typography variant="h4" style={{ flexGrow: 1, marginLeft: '1em', color: 'rgba(0,0,0,0.9)' }}>
            <A href="/">
              СоцКооп
            </A>
          </Typography>


          {admin &&
            <A href="/procurement" title="Закупка">
              <Typography color="primary">
                {ru.format(procurementTotal)}
              </Typography>
            </A>
          }
          {admin &&
            <IconButton href="/procurement" color="primary" title="Закупка">
              {procurementOrderCount
                ? <Badge badgeContent={procurementOrderCount} color="primary">
                  <PointOfSaleIcon />
                </Badge>
                : <PointOfSaleIcon />
              }
            </IconButton>
          }


          <A href="/cart" style={{ color: 'rgba(0,0,0,0.54)' }} title="Корзина">
            <Typography>
              <CartValue />
            </Typography>
          </A>
          <IconButton href="/cart" title="Корзина">
            <ShoppingCartIcon />
          </IconButton>

          <IconButton href="/orders" title="Заказы">
            {ordersCount
              ? <Badge badgeContent={ordersCount} color="primary">
                <ReceiptIcon />
              </Badge>
              : <ReceiptIcon />
            }
          </IconButton>

          <IconButton onClick={toggleUserMenuOpen}>
            <PersonIcon />
          </IconButton>

        </Stack>
      </AppToolbar>
    </AppBar>
  )
}
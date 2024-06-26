import { Router } from 'express'
import { Match } from '../../models'

export const account = Router()

account.get('/:account/deals', async (req, res) => {
  const network = req.app.get('network')
  const { account } = req.params

  const { from, to, limit, skip, market } = req.query

  const $match = { chain: network.name, $or: [{ asker: account }, { bidder: account }] }

  if (market) $match.market = parseInt(market)

  if (from && to) {
    $match.time = {
      $gte: new Date(parseFloat(from) * 1000),
      $lte: new Date(parseFloat(to) * 1000)
    }
  }

  const q = [
    { $match },
    { $sort: { time: -1 } },
    {
      $project: {
        time: 1,
        bid: 1,
        ask: 1,
        unit_price: 1,
        trx_id: 1,
        market: 1,
        type: 1,
        bidder: 1,
        asker: 1
      }
    }
  ]

  if (skip) q.push({ $skip: parseInt(skip) })
  if (limit) q.push({ $limit: parseInt(limit) })

  const history = await Match.aggregate(q)

  res.json(history)
})

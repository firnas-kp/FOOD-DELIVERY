import React, { useEffect, useState, useContext } from 'react'
import './Offers.css'
import axios from 'axios'
import { StoreContext } from '../../context/StoreContext'

const Offers = () => {

  const { url } = useContext(StoreContext)
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(url + "/api/coupon/public")
      if (res.data.success) {
        setCoupons(res.data.data)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert("Coupon copied: " + code)
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  return (
    <div className='offers'>
      <h2>Available Offers</h2>

      {loading ? <p>Loading...</p> : (
        <div className='offers-list'>
          {coupons.length === 0 && <p>No offers available</p>}

          {coupons.map((item, index) => (
            <div className='offer-card' key={index}>
              <h3>{item.code}</h3>
              <p>{item.description || "Special discount available"}</p>

              <p>
                {item.discountType === "percent"
                  ? `${item.discountValue}% OFF`
                  : `$${item.discountValue} OFF`}
              </p>

              <button onClick={() => copyCode(item.code)}>
                Copy Code
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Offers
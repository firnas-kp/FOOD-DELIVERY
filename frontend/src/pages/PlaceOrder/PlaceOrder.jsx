import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {

  const {getTotalCartAmount,token,food_list,cartItems,url} = useContext(StoreContext)
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""
  })

  const onChangehandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item)=>{
      if (cartItems[item._id]>0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    })
    const baseAmount = getTotalCartAmount();
    const discount = couponData?.discount || 0;
    const finalSubtotal = Math.max(0, baseAmount - discount);
    let orderData = {
      address:data,
      items:orderItems,
      baseAmount,
      amount:finalSubtotal+2,
      couponCode: couponData?.code || "",
    }
    let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}})
    if (response.data.success) {
      const {session_url}=response.data;
      window.location.replace(session_url);
    }
    else{
      alert(response.data?.message || "Error")
    }
  }

  const navigate = useNavigate();

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const response = await axios.post(url + "/api/coupon/validate", {
        code: couponCode,
        amount: getTotalCartAmount(),
      });
      if (response.data.success) {
        setCouponData(response.data.data);
        alert(`Coupon applied! You save $${response.data.data.discount}`);
      } else {
        setCouponData(null);
        alert(response.data.message || "Invalid coupon");
      }
    } catch {
      setCouponData(null);
      alert("Could not validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(()=>{
    if (!token) {
      navigate('/cart')
    }
    else if(getTotalCartAmount()===0)
    {
      navigate('/cart')
    }
  },[token])

  return (
    <div>
      <form onSubmit={placeOrder} className='place-order'>
        <div className="place-order-left">
          <p className="title">Delivery Information</p>
          <div className="multi-fields">
            <input required name='firstName' onChange={onChangehandler} value={data.firstName} type="text" placeholder='firstName'/>
            <input required name='lastName' onChange={onChangehandler} value={data.lastName} type="text" placeholder='lastName'/>
          </div>
          <input required name='email' onChange={onChangehandler} value={data.email} type="email" placeholder='email'/>
          <input required name='street' onChange={onChangehandler} value={data.street} type="text" placeholder='street'/>
          <div className="multi-fields">
            <input required name='city' onChange={onChangehandler} value={data.city} type="text" placeholder='City'/>
            <input required name='state' onChange={onChangehandler} value={data.state} type="text" placeholder='State'/>
          </div>
          <div className="multi-fields">
            <input required name='zipcode' onChange={onChangehandler} value={data.zipcode} type="text" placeholder='Zip code'/>
            <input required name='country' onChange={onChangehandler} value={data.country} type="text" placeholder='Country'/>
          </div>
          <input required name='phone' onChange={onChangehandler} value={data.phone} type="text" placeholder='Phone' />
        </div>
        <div className="place-order-right">
          <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount()}</p>
            </div>
            {couponData && (
              <>
                <hr />
                <div className="cart-total-details">
                  <p>Coupon ({couponData.code})</p>
                  <p>-${couponData.discount}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>${getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
            <b>Total</b>
            <b>${getTotalCartAmount()===0?0:Math.max(0, getTotalCartAmount()-(couponData?.discount||0))+2}</b>
            </div>
          </div>
          </div>
          <div className="place-order-coupon">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button type="button" onClick={applyCoupon} disabled={couponLoading}>
              {couponLoading ? "Applying..." : "Apply"}
            </button>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </form>
      
    </div>
  )
}

export default PlaceOrder

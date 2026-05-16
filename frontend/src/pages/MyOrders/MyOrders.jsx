// import React, { useContext, useEffect, useState } from 'react'
// import './MyOrders.css'
// import { StoreContext } from '../../context/StoreContext';
// import axios from 'axios';
// import { assets } from '../../assets/assets';

// const MyOrders = () => {

//     const {url,token} = useContext(StoreContext);
//     const [data,setData] = useState([]);

//     const fetchOrders = async () => {
//         const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
//         setData(response.data.data);
//     }

//     useEffect(() => {
//         if (token) {
//             fetchOrders();
//         }
//     },[token])


//   return (
//     <div className='my-orders'>
//       <h2>My Orders</h2>
//       <div className="container">
//         {data.map((order,index) => {
//             return (
//                 <div key={index} className="my-orders-order">
//                     <img src={assets.parcel_icon} alt="" />
//                     <p>{order.items.map((item,index)=>{
//                         if (index === order.items.length-1) {
//                             return item.name+" x "+item.quantity
//                         }
//                         else{
//                             return item.name+" x "+item.quantity+", "   
//                         }
//                     })}</p>
//                     <p>${order.amount}.00</p>
//                     <p>Items: {order.items.length}</p>
//                     <p><span>&#x25cf;</span><b>{order.status}</b></p>
//                     <button onClick={fetchOrders} >Track Order</button>
//                 </div>
//             )
//         })}
//       </div>
//     </div>
//   )
// }

// export default MyOrders

import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {

    const {url,token} = useContext(StoreContext);
    const [data,setData] = useState([]);
    const [loading,setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
            setData(response.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    },[token])

  return (
    <div className='my-orders'>
      <h2 className="title">🎉 Your Orders</h2>

      {loading ? (
        <div className="loader"></div>
      ) : data.length === 0 ? (
        <p className="empty">No orders yet 😢</p>
      ) : (
        <>
          <div className="success-msg">
            ✅ Your order has been successfully completed!
          </div>

          <div className="container">
            {data.map((order,index) => (
                <div key={index} className="my-orders-order">
                    <img src={assets.parcel_icon} alt="" />

                    <div className="order-details">
                        <p className="items">
                          {order.items.map((item,i)=>(
                            i === order.items.length-1
                              ? item.name+" x "+item.quantity
                              : item.name+" x "+item.quantity+", "
                          ))}
                        </p>

                        <p className="amount">₹{order.amount}</p>
                        <p className="count">Items: {order.items.length}</p>

                        <p className={`status ${order.status}`}>
                          ● {order.status}
                        </p>

                        <button onClick={fetchOrders}>
                          Track Order 🚚
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default MyOrders
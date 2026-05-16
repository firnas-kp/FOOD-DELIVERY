import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({ id, name, price, description, image, inStock, isVegetarian, prepTimeMins, restaurantName }) => {

    const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const available = inStock !== false;
    const prep = prepTimeMins != null && prepTimeMins > 0 ? prepTimeMins : 20;

  return (
    <div className={`food-item ${!available ? 'food-item--unavailable' : ''}`}>
        <div className="food-item-img-container">
            <img className='food-item-image' src={url+"/images/"+image} alt="" />
            {!available && (
              <div className="food-item-stock-badge">Unavailable</div>
            )}
            {available && (
              !cartItems[id]
                ?<img className='add' onClick={()=>addToCart(id)} src={assets.add_icon_white} alt="" />
                :<div className='food-item-counter'>
                    <img onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                    <p>{cartItems[id]}</p>
                    <img onClick={()=>addToCart(id)} src={assets.add_icon_green} alt="" />
                </div>
            )}
        </div>
        <div className="food-item-info">
            <div className="food-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_starts} alt="" />
            </div>
            <div className="food-item-meta">
              {restaurantName ? (
                <span className="food-item-tag food-item-tag--restaurant">{restaurantName}</span>
              ) : (
                <span className="food-item-tag food-item-tag--restaurant food-item-tag--house">Tomato Kitchen</span>
              )}
              {isVegetarian === true && <span className="food-item-tag food-item-tag--veg">Vegetarian</span>}
              <span className="food-item-tag food-item-tag--time">~{prep} min</span>
            </div>
            <p className="food-item-desc">{description}</p>
            <p className="food-item-price">${price}</p>
        </div>
    </div>
  )
}

export default FoodItem

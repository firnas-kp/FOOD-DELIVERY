import React, { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from "axios"
import { toast } from 'react-toastify'

const Add = ({ url, token }) => {

  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    prepTimeMins: "20",
    inStock: true,
    isVegetarian: false,
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("price", (data.price))
    formData.append("category", data.category)
    formData.append("prepTimeMins", data.prepTimeMins || "20")
    formData.append("inStock", data.inStock ? "true" : "false")
    formData.append("isVegetarian", data.isVegetarian ? "true" : "false")
    formData.append("image", image)
    const response = await axios.post(`${url}/api/food/add`, formData, {
      headers: { token },
    });
    if (response.data.success) {
      setData({
        name: "",
        description: "",
        price: "",
        category: "Salad",
        prepTimeMins: "20",
        inStock: true,
        isVegetarian: false,
      })
      setImage(false)
      toast.success(response.data.message)
    }
    else {
      toast.error(response.data.message)
    }


  }
  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-image-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Product Name' required />
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder='Product Description' required></textarea>
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} name="category">
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="Number" name='price' placeholder='$20' />
          </div>
        </div>
        <div className="add-extras flex-col">
          <p>Prep time (minutes)</p>
          <input
            onChange={onChangeHandler}
            value={data.prepTimeMins}
            type="number"
            name="prepTimeMins"
            min={1}
            placeholder="20"
          />
        </div>
        <div className="add-checkboxes">
          <label className="add-checkbox-row">
            <input
              type="checkbox"
              name="inStock"
              checked={data.inStock}
              onChange={(e) => setData((d) => ({ ...d, inStock: e.target.checked }))}
            />
            <span>In stock (available to order)</span>
          </label>
          <label className="add-checkbox-row">
            <input
              type="checkbox"
              name="isVegetarian"
              checked={data.isVegetarian}
              onChange={(e) => setData((d) => ({ ...d, isVegetarian: e.target.checked }))}
            />
            <span>Vegetarian</span>
          </label>
        </div>
        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  )
}

export default Add

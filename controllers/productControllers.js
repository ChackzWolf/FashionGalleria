const ProductModel = require("../models/Product");
const path = require("path");
const { upload } = require('../utils/imageHandler');
const fs = require('fs');
const Swal = require('sweetalert2');
const CategoryModel = require("../models/Category");


const  addProduct = async (req,res) =>{
    const {name,price,description,stockLarge,stockMedium,stockSmall} = req.body;
    const sizeStock = {
      sizeLarge: {
        large: "Large",
        stock: parseInt(stockLarge) || 0
      },
      sizeMedium: {
        medium: "Medium",
        stock: parseInt(stockMedium) || 0
      },
      sizeSmall: {
        small: "Small",
        stock: parseInt(stockSmall) || 0
      }
    }

        if(price<1){
        
        
            const categoryConnect = await CategoryModel.findOne({name:req.body.category})
        
            console.log(req.files) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
            const images = req.files
                                .filter((file) =>
                                      file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp")
                                .map((file) => file.filename);   
            if(images.length ===3){
                const data = {
                  name,
                  price,
                  description,
                  cat:categoryConnect,
                  sizeStock:sizeStock,
                  imageUrl:images,
                  listStatus:true,
                  deleteStatus:false,
                }
                console.log(data);
                let product = await ProductModel.create(data);
              
                if(product){
                  let success = true
                  console.log("success")
                  const category = await ProductModel.aggregate([{$match:{_id:product._id}},
                                                                      {$lookup:{from:'categories',
                                                                      localField:'cat',
                                                                      foreignField:'_id',
                                                                      as:'cat'}}]);
                  
                  console.log(category[0].cat[0].name, 'this is the thing')
                  
                  const updatedCategory = category[0].cat[0].name;
                  
                  product = await ProductModel.updateOne({_id: product._id},{$set:{category: updatedCategory}});
                  console.log('category added',product);
                  
                  
                  console.log(product)                                                      
                  // alert("Product has listed",product);
                  // res.status(200).json({ success: true, msg: "Product has been listed", data: product });
                  // res.status(200).send({success:true,msg:"Product details", data:product});
                  res.redirect(`/admin/add-product?success=${success}`);
                  
                }else{
                  let unsuccess = true
                  res.redirect(`/admin/add-product?success=${unsuccess}`);
                }
        }else{
            const wrongEntry = true;
            res.redirect(`/admin/add-product?worngEntry=${wrongEntry}`)
        }
    }  
}                           
  
  




const listUnlistProduct = async(req,res)=>{
  console.log("step1")
  const product = await ProductModel.findById({_id:req.params.id})                    
  if(product){
    console.log("step2")
    const update = await ProductModel.updateOne({_id:product.id}, {$set: {listStatus:!product.listStatus}})
    if(update){
      console.log("step3")
      const products = await ProductModel.find({deleteStatus:false})
      res.render("admin/edit-product",{products})
    }else{
      console('not updated.')
      res.render("admin/edit-product")
    }
  }
}

const listUnlistCategory = async(req,res)=>{
    console.log('step1')
    const categoryName = req.body.category;
    const subCategory = req.body.subCategory;
    console.log(categoryName);
    console.log(subCategory);
    const category = await ProductModel.findById({_id:req.params.id})
    console.log(category)
    if(category){
        console.log(category);
        const update = await CategoryModel.updateOne({category:categoryName,subCategory:subCategory},{$set:{listStatus:!category.listStatus}});
        if(update){
            console.log(update);
            const categories = await CategoryModel.find()
            res.render("admin/category-list",{categories});
        }else{
            console.log('not updated');
            res.render("admin/category-list");
        }
    } 
}

const editedProductDetails = async (req,res)=>{
  const {id, name, price , description, stockLarge, stockMedium, stockSmall, category } = req.body;


  const sizeStock = {
    sizeLarge:{
      stock: stockLarge
    },
    sizeMedium: {
      stock: stockMedium
    },
    sizeSmall:{
      stock: stockSmall
    }
  }

  
  const images = req.files
  .filter((file) =>
      file.mimetype === "image/png" || file.mimetype === "image/webp" || file.mimetype === "image/jpeg")
  .map((file) => file.filename);

  
  const existingProduct = await ProductModel.findById(id);
  if(!existingProduct){
    return res.status(404).send("Product not found.");
  }
  if(!req.file||req.files.length === 0){

    const updateData = {
      name: name,
      price: price,
      description: description,
      sizeStock: sizeStock,
      category: category,
      imageUrl: images
    };


    const update = await ProductModel.updateOne({_id:id},{$set: updateData})
    if(update){
      let success = true
      res.redirect(`/admin/edit-product?success=${success}`)
      console.log(success)
    }else{
      console.log("update nadannila....")
      res.render("admin/edit-product");
    }
  }
}

const editProductDetailsView = async(req,res)=>{
  const editProduct = await ProductModel.findOne({_id:req.query.id});
  res.render("admin/edit-product-details",{editProduct});
}

const deleteProduct = async(req,res)=>{
  const productID = req.params.id
  const product = await ProductModel.findById({_id:productID})
  console.log(productID,'dddiddddddddd');
  console.log(product,'dddddddddddddddddd')
  if(!product){
    return res.status(404).json({message: "product not found."})
  }else{
    
    for(const imageUrl of product.imageUrl){
      deleteFile(imageUrl)
    }

    await ProductModel.updateOne({_id:productID}, {$set:{deleteStatus: true}})
    msgDelete = true
    res.redirect("/admin/edit-product")
  }

}


const deleteFile = (filePath) => {
  // Construct the absolute path to the file
  const absoluteFilePath = path.join(__dirname,"..","public","uploaded-images",filePath);

  // Delete the file
  fs.unlink(absoluteFilePath, (err) => {
      if (err) {
        console.log("error deleting file");
          // res.status(404).render("user/error-handling");

      } else {
          console.log("File deleted successfully:", absoluteFilePath);
      }
  });
};


const addCategory = async(req,res)=>{
  console.log(req.body,"dddddddddddddddddddddd")
  const categoryName = req.body.name;
  const categoryData = {
    name:categoryName,
    listStatus:true
  }
    if(categoryName !==''){
        const categoryExist  = await CategoryModel.findOne({name:categoryName});
        if(categoryExist){
            console.log('category exists')
            res.redirect(`/admin/add-category?exists=${exists}`)
            console.log("category already exists.")
        }else{
                
            console.log("category deos'nt exists");
            const category = await CategoryModel.create(categoryData)
            console.log(category)
            if(category){
                let success = true
                console.log("success");
                res.redirect(`/admin/add-product?success=${success}`);
            }           
        }         
    }
    else{
        const fieldEmpty = true;
        console.log("field was empty");
        res.render("admin/add-product",{fieldEmpty});
    }    
}

 
 
module.exports = {
    addProduct,
    listUnlistProduct,
    editProductDetailsView,
    editedProductDetails,
    deleteProduct,
    addCategory,
    listUnlistCategory
}
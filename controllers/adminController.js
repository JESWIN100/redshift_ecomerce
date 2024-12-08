const pool =require ("../config/db/db.js");
const bcrypt =require ('bcryptjs');
const nodemailer =require ('nodemailer')

 const loadLogin = async (req, res) => {
    res.render('login');
}
 const loadSignUp = async (req, res) => {
    res.render('sign-up');
}


 const loadLogout=(req,res)=>{
    res.render('login');
}
 const errrorPage=(req,res)=>{
    res.render('error');
}


 const homePage= async(req,res)=>{
    try {
        // Query for users
        const [users] = await pool.query('SELECT * FROM usermanagement ORDER BY created_at DESC LIMIT 8');

       
        // Query for products
        const query = 'SELECT * FROM products ORDER BY created_at DESC LIMIT 8';
        const [products] = await pool.query(query);


        const [orders] = await pool.query('SELECT * FROM payments');
     
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0)


        const [paymentDetails] = await pool.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 8');

    

        
        // Parse items for each payment record
        const items = paymentDetails.map(payment => {
            return payment.items.split(',').map(item => {
                const [product_id, product_name, product_price, product_image, quantity] = item.split('|');
                return { 
                    product_id, 
                    product_name, 
                    product_price, 
                    product_image, 
                    quantity ,
                    payment_method: payment.payment_method ,
                    order_status:payment.order_status,
                    order_date:payment.created_at
                };
            });
        }).flat();  // Flatten the array to handle multiple orders

     
        

        const data = {
            totalUsers: users.length,
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue: totalRevenue,
        };
     



        
        // Render the index page with both customers and products
        res.render('index', {
            customers: users,
            topProducts: products,
            data: data,
            orders:items

        });

    } catch (error) {
        console.log(error);
    }
}
 const loadCouponList=async(req,res)=>{
    try {
        // Retrieve all coupons from the database
        const [coupons] = await pool.query('SELECT * FROM coupons');

        res.render('coupon-list',{coupons});

      
    } catch (error) {
        console.error('Error during fetching coupons:', error.message);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
  
}







 const loadGetUserList =async (req, res) => {
    try {


        const [users] = await pool.query('SELECT * FROM usermanagement');
        res.render('user-list',{users});
        // console.log(users);
    } catch (error) {
        console.log(error);
        
    }
}


 const loadGetMainCategory = async(req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM category');

console.log(categories);

       
    res.render('main-category',{ categories});

 
  
    
       
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
}


 const loadGetProductsList =async (req, res) => {
    try {
        const query = 'SELECT * FROM products';
        const [products] = await pool.query(query);
        const [categories] = await pool.query('SELECT * FROM category');
    
    
        

    res.render('product-list',{ products,categories });
        
       
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}
 const loadGetProductsAdd =async (req, res) => {
try {
    const [categories] = await pool.query('SELECT * FROM category');
 
    
    res.render('product-add',{categories});

} catch (error) {
    console.log(error);
    
}
  
}




 const loadGetOrdersOrderDetails =async (req, res) => {
    try {
        const {id}=req.params
       
        
        // Fetch payment details, including serialized cart items, from the database
        const [paymentDetails] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);

        if (!paymentDetails.length) {
            return res.status(404).json({ message: 'No payment details found.' });
          }
          
        
        // Deserialize the cart items from the "items" column (assuming it's serialized as | separated string)
        const items = paymentDetails[0].items.split(',').map(item => {
            const [product_id, product_name, product_price, product_image, quantity] = item.split('|');
            return { product_id, product_name, product_price, product_image, quantity };
        });
        
        // Pass the cart items and total amount to the EJS template
        const totalAmount = paymentDetails[0].amount 
        const order=paymentDetails
        // console.log("items",order);
        


        console.log(order[0].user_id);
        
        const [userDetail] = await pool.query('SELECT * FROM usermanagement WHERE id = ?', [order[0].user_id]);


     
      
        res.render('order-detail', { items, totalAmount,order:order[0],userDetail:userDetail[0] });
        

    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ message: error.message });

    }
    
}

 const loadGetOrdersOrderHistory = async(req, res) => {

    try {
        // Fetch all orders from the 'payments' table
        const [orders] = await pool.query('SELECT * FROM payments');
        // console.log(orders);
    
        // Create an array to hold updated order data with user details
        const ordersWithUserDetails = [];
    
        // Iterate over each order to retrieve the user details
        for (let order of orders) {
          const userId = order.user_id;  // Get the user_id from the order
          console.log(`Fetching details for user_id: ${userId}`);
    
          // Query the 'userManagement' table to get user details based on user_id
          const [userResults] = await pool.query('SELECT * FROM userManagement WHERE id = ?', [userId]);
          
          if (userResults.length > 0) {
            // Add customer and email to the order
            order.customer = userResults[0].name || 'Unknown';  // Assuming 'name' is the user's name field
            order.email = userResults[0].email || 'Unknown';    // Assuming 'email' is the user's email field
          } else {
            order.customer = 'Unknown';
            order.email = 'Unknown';
          }
    
          // Add the updated order to the list
          ordersWithUserDetails.push(order);
        }
    
    
        // Render the order-history page with the updated order list
        res.render('order-history', { orders: ordersWithUserDetails });
    
      } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal server error");
      }
}

 const loadEditService = async (req, res) => {
    try {

        const { id } = req.params;
  
          // Use await with the promise-based query function
          const [results] = await pool.query('SELECT * FROM userManagement WHERE id = ?', [id]);
   
      
          // Check if the user exists
          if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          // Send the user data as the response
        //   return res.status(200).json(results[0]);
          
        return res.render('user-list',{results});

    } catch (error) {
        console.error("Error fetching record:", error);
        res.status(500).json({ message: "An error occurred while fetching the record", error: error.message });
    }
};












 const createAdmin = async (req, res) => {
    const { email, password } = req.body;


    // Validate email and password
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Check if the admin with this email already exists
        const [existingAdmin] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);

        if (existingAdmin && existingAdmin.length > 0) {
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new admin into the database
        const [newAdmin] = await pool.query('INSERT INTO admin (email, password) VALUES (?, ?)', [email, hashedPassword]);

        // Return success response
        return res.status(201).json({
            message: 'Admin created successfully',
            user: {
                id: newAdmin.insertId,
                email: email,
            },
        });
    } catch (error) {
        console.error('Error during admin creation:', error);
        return res.status(500).json({ message: error.message });
    }
};


 const loginAdmin = async (req, res) => { 
    const { email, password } = req.body;


    // Validate input
    if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/admin');
    }

    try {
        // Check admin existence
        const [rows] = await pool.query('SELECT * FROM admin WHERE email = ?', [email]);

        if (!rows || rows.length === 0) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/admin');
        }

        const admin = rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/admin');
        }

        // Set session
        req.session.admin_id = admin.id;
console.log(req.session.admin_id);

        // Redirect on success
        return res.redirect('/admin/home');
    } catch (error) {
        console.error('Error during login:', error.message);
        req.flash('error', error.message);
        return res.redirect('/admin');
    }
};


// Logout Controller 
 const logoutAdmin = (req, res) => {
    
    
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error while signing out:', err);
                return res.status(500).send('Error occurred during signout.');
            }
            res.redirect('/admin/'); 
        });
    } catch (error) {
        console.log(error.message);

    }
};

///////////////////////////////////////////////////////////AdminUserAdd/////////////////////

 const addUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if required fields are provided
        if (!name || !email || !phone || !password) {
            req.flash('error', 'Name, email, phone, and password are required.');
            return res.redirect('/admin/user-list');
        }

        // Check if email already exists
        const [existingEmail] = await pool.query('SELECT * FROM userManagement WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            req.flash('error', 'Email already registered.');
            return res.redirect('/admin/user-list');
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Insert new user into the database with hashed password
        const query = `INSERT INTO userManagement (name, email, phone, password) 
                       VALUES (?, ?, ?, ?)`;
        const [results] = await pool.query(query, [name, email, phone, hashedPassword]);

        // Redirect to user list after successful addition with a success message
        req.flash('success', 'User added successfully!');
         res.redirect('/admin/user-list?success===true');

    } catch (error) {
        console.error('Error during add user:', error.message);
        req.flash('error', error.message);
        return res.redirect('/admin/user-list');
    }
};



// READ: Get all users
 const getUsers = async (req, res) => {
    try {
        // Fetch users from the database or define a sample list
        const [users] = await pool.query('SELECT * FROM usermanagement');
        

       
        res.render("user-list", { users });
           
        
    } catch (error) {
        console.error('Error loading user list:', error);
        res.status(500).send(error.message);
    }
};
  
// READ: Get a user by ID

 const userGetById = async (req, res) => {
    const { id } = req.params;
 
  
    try {
      // Use await with the promise-based query function
      const [results] = await pool.query('SELECT * FROM userManagement WHERE id = ?', [id]);
  
      // Check if the user exists
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

  
      // Send the user data as the response
      return res.status(200).json(results[0]);
      
    } catch (error) {
      console.error('Error fetching user:', error.message);
      return res.status(500).json({ message: 'Error fetching user' });
    }
  };
  

// UPDATE: Update a user by ID
 const userUpdate = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;


    // Prepare an array to dynamically build the SET clause and parameters
    const fields = [];
    const values = [];

    // Dynamically add fields to update
    if (name !== undefined) {
        fields.push("name = ?");
        values.push(name);
    }
    if (email !== undefined) {
        fields.push("email = ?");
        values.push(email);
    }
    if (phone !== undefined) {
        fields.push("phone = ?");
        values.push(phone);
    }
    if (password !== undefined) {
        fields.push("password = ?");
        values.push(password);
    }

    // Ensure there are fields to update
    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided to update" });
    }

    // Add the user ID to the parameters
    values.push(id);

    // Construct the query dynamically
    const query = `UPDATE userManagement 
                   SET ${fields.join(", ")} 
                   WHERE id = ?`;

    try {
        // Use await with a promise-based query function
        const [results] = await pool.query(query, values);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.redirect("/admin/user-list?updated=true");
    } catch (err) {
        console.error('Error updating user:', err.message);
        return res.status(500).json({ message: err.message });
    }
};


// DELETE: Delete a user by ID
 const userDelete = async (req, res) => {
    const { id } = req.params;
  
    const query = 'DELETE FROM userManagement WHERE id = ?';
  
    try {
      // Use await with the promise-based query function
      const [results] = await pool.query(query, [id]);
  
      // Check if any rows were affected (i.e., if the user was found and deleted)
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.redirect('/admin/user-list?deleted=true')
    //   return res.status(200).json({ message: 'User deleted successfully' });
  
    } catch (err) {
      // Log and return error response
      console.error('Error deleting user:', err.message);
      return res.status(500).json({ message: err.message });
    }
  };
  

  ///////////////////////////////////////////////////////////End of AdminUserAdd/////////////////////



   const AdminAddProduct = async (req, res) => {
    try {
      // Retrieve the uploaded files
      const files = req.files;
      const mainImage = files.image_url ? files.image_url[0].filename : null;
      const additionalImages = files.additional_images ? files.additional_images.map(file => file.filename) : [];
  
      // Get the product details from the request body
      const { product_name, description, price, category } = req.body;
  
      // Split category into ID and name (assuming value is "ID:Name")
      const [categoryId, categoryName] = category.split(':');
  
      // Validate required fields
      if (!product_name || !description || !price || !categoryId || !categoryName) {
        req.flash('error', 'Product name, description, category, and price are required');
        return res.redirect('/admin/product-add');
      }
     
      // Construct image URLs
      const mainImageUrl = mainImage ? `/uploads/${mainImage}` : null;
      const additionalImageUrls = additionalImages.map(image => `/uploads/${image}`);
  
      // Insert the product data into the database
      const query = `INSERT INTO products (product_name, description, category, category_name, price, image_url, additional_images) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const [results] = await pool.query(query, [
        product_name,
        description,
        categoryId,
        categoryName,
        price,
        mainImageUrl,
        JSON.stringify(additionalImageUrls) // Store additional images as JSON
      ]);
  
      // Redirect or send success response
      res.redirect('/admin/product-add?success=true');
    } catch (error) {
     
      req.flash({message: error.message});
        return res.redirect('/admin/product-add');
    //   return res.status(500).json({ message: error.message });

    }
  };
  
  

// Get all products
 const getAllProducts = async (req, res) => {
    try {
        const query = 'SELECT * FROM products';
        const [products] = await pool.query(query);
        
       
        return res.status(200).json({
            message: 'Products retrieved successfully',
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Get product by ID
 const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM products WHERE product_id = ?';
        const [rows] = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        return res.status(200).json({
            message: 'Product retrieved successfully',
            product: rows[0]  // Ensure you're returning the first product if multiple rows exist
        });
    } catch (error) {
        console.error('Error fetching product by ID:', error.message);
        return res.status(500).json({ message: error.message });
    }
};


// Update product
 const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, price, product_name,category } = req.body;
        console.log(req.body);
        
        const image = req.file ? req.file.filename : null;

        // Construct the fields to update dynamically
        const fieldsToUpdate = [];
        const values = [];

        if (description) {
            fieldsToUpdate.push('description = ?');
            values.push(description);
        }

        if (price) {
            fieldsToUpdate.push('price = ?');
            values.push(price);
        }

        if (product_name) {
            fieldsToUpdate.push('product_name = ?');
            values.push(product_name);
        }
        if (category) {
            fieldsToUpdate.push('category_name = ?');
            values.push(category);
        }
        if (image) {
            fieldsToUpdate.push('image_url = ?');
            values.push(`/uploads/${image}`); // Adjust the path if necessary
        }

        // If no fields to update, return an error
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add the product ID to the values array
        values.push(id);

        // Construct the SQL query
        const query = `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE product_id = ?`;

        // Execute the query
        const [results] = await pool.query(query, values);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
res.redirect('/admin/product-list?updated=true')
        // Return a success response
        // return res.status(200).json({
        //     message: 'Product updated successfully',
        //     updatedFields: {
        //         description,
        //         price,
        //         product_name,
        //         image_url: image ? `/uploads/${image}` : null
        //     }
        // });
    } catch (error) {
        console.error('Error updating product:', error.message);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Delete product
const fs = require('fs');
const path = require('path');


const deleteFile = async (filePath) => {
    const fullPath = path.join(__dirname, '..', 'public', filePath);
    try {
        await fs.promises.unlink(fullPath);  // Asynchronous deletion
        console.log(`Deleted file: ${fullPath}`);
    } catch (err) {
        console.log(`Failed to delete file: ${fullPath}, Error: ${err.message}`);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Query to fetch the product details, including the image paths
        const query = 'SELECT * FROM products WHERE product_id = ?';
        const [product] = await pool.query(query, [id]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Extract the file paths for the images
        const { image_url, additional_images } = product[0];

        // Delete the main product image
        deleteFile(image_url);

        // Delete the additional images
        const additionalImages = JSON.parse(additional_images);


        additionalImages.forEach(image => deleteFile(image));

        // Now delete the product from the database
        const deleteQuery = 'DELETE FROM products WHERE product_id = ?';
        const [results] = await pool.query(deleteQuery, [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Redirect after successful deletion
        res.redirect("/admin/product-list?deleted=true");
    } catch (error) {
        console.error('Error deleting product:', error.message);
        return res.status(500).json({ message: error.message });
    }
};




 const createCategory = async (req, res) => {
    const { categoryName, categoryDescription } = req.body;
    const categoryImage = req.files?.categoryImage?.[0]?.filename || null;

    // Validate input fields
    if (!categoryName || !categoryDescription || !categoryImage) {
        req.flash('error', 'All fields, including category image, are required.');
        return res.redirect('/admin/main-category');
    }

    try {
        // Check if category exists
        const [existingCategory] = await pool.query('SELECT * FROM category WHERE categoryName = ?', [categoryName]);

        if (existingCategory.length > 0) {
            req.flash('error', 'Category with this name already exists.');
            return res.redirect('/admin/main-category');
        }

        // Insert into database
        const [newCategory] = await pool.query(
            'INSERT INTO category (categoryName, categoryDescription, categoryImage) VALUES (?, ?, ?)',
            [categoryName, categoryDescription, categoryImage]
        );

        // Redirect with success message
        req.flash('success', 'Category created successfully!');
        return res.redirect('/admin/main-category?success=true');
    } catch (error) {
        console.error('Error during category creation:', error.message);
        req.flash('error', 'Internal server error. Please try again later.');
        return res.redirect('/admin/main-category');
    }
};



 const getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM category');
        return res.status(200).json({
            message: 'Categories fetched successfully',
            categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


const deletecategoryFile = async (fileName) => {
    const fullPath = path.join(__dirname, '..', 'public', 'uploads', fileName);
    try {
        await fs.promises.unlink(fullPath); // Async deletion of file
        console.log(`Deleted file: ${fullPath}`);
    } catch (err) {
        console.log(`Failed to delete file: ${fullPath}, Error: ${err.message}`);
    }
};



const deleteCategoryById = async (req, res) => {
    const { id } = req.params;

    // Check if the category ID is provided
    

    try {
        // Check if the category exists in the database
        const [existingCategory] = await pool.query('SELECT * FROM category WHERE id = ?', [id]);

        if (!existingCategory || existingCategory.length === 0) {
            req.flash('error', 'All fields, including category image, are required.');
        return res.redirect('/admin/main-category');
        }

        // Assuming the category image is stored in 'categoryImage' column
        const { categoryImage } = existingCategory[0];  // Get the image filename

        // If category has an associated image, delete it
        if (categoryImage) {
            deletecategoryFile(categoryImage);  // Call the function to delete the image
        }

        // Delete the category from the database
        await pool.query('DELETE FROM category WHERE id = ?', [id]);

        // Send success response
      res.redirect("/admin/main-category?deleted=true")

    } catch (error) {
        console.error('Error deleting category:', error.message);
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};



 const createCoupon = async (req, res) => {
    const { couponcode, discount } = req.body;

    // Validate required fields
    if (!couponcode || !discount ) {
        req.flash('error', 'Coupon code and discount are required.');
        return res.redirect('/admin/coupon-list');
    }

    try {
        // Check if the coupon with this code already exists
        const [existingCoupon] = await pool.query('SELECT * FROM coupons WHERE couponcode = ?', [couponcode]);

        if (existingCoupon && existingCoupon.length > 0) {
            req.flash('error', 'Coupon with this code already exists.');
            return res.redirect('/admin/coupon-list');
        }

        // Insert new coupon into the database
        const [newCoupon] = await pool.query(
            'INSERT INTO coupons (couponcode, discount) VALUES (?, ?)', 
            [couponcode, discount]
        );

        // Redirect to admin page or return success response
        res.redirect("/admin/coupon-list?success=true");
      

    } catch (error) {
        req.flash(error.message);
        return res.redirect('/admin/coupon-list');
    }
};

 const getAllCoupons = async (req, res) => {
    try {
        // Retrieve all coupons from the database
        const [coupons] = await pool.query('SELECT * FROM coupons');

        // Return the list of coupons
        res.status(200).json({
            message: 'Coupons retrieved successfully',
            data: coupons,
        });
    } catch (error) {
        console.error('Error during fetching coupons:', error.message);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


 const deleteCouponById = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the coupon with the given ID exists
        const [existingCoupon] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);

        if (!existingCoupon || existingCoupon.length === 0) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Delete the coupon from the database
        await pool.query('DELETE FROM coupons WHERE id = ?', [id]);

       res.redirect("/admin/coupon-list?deleted=true")
  
    } catch (error) {
        console.error('Error during coupon deletion:', error.message);
        res.status(500).json({ message: error.message });
    }
};









const logo="/assets/images/logo/LOGO DESIGN RED SHIFT _page-0001.jpg"
  const orderStatusUpdate=async(req, res) => {
    const { order_id, order_status, customer_email,customer_name } = req.body;
  
    console.log(req.body);
    
    // Validate inputs
    if (!order_id || !order_status) {
      return res.status(400).send('Missing required fields');
    }
  
    // Update order status in MySQL database
    const query = 'UPDATE payments SET order_status = ? WHERE id = ?';
  
    pool.query(query, [order_status, order_id])

    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.Nodemailer_User, 
            pass: process.env.Nodemailer_Pass    
        }
    });

    // Set up the email options
    const mailOptions = {
        from: process.env.Nodemailer_User,
        to: 'jeswinjoseph654@gmail.com',
        subject: 'Your Order Status Update',
        html: `
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .header img {
                    width: 100px;
                    height: auto;
                    margin-bottom: 10px;
                }
                .content {
                    padding: 20px;
                    font-size: 16px;
                    color: #333333;
                }
                .footer {
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                    color: #777777;
                }
                .footer a {
                    color: #4CAF50;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <img src="assets/images/logo/LOGO DESIGN RED SHIFT _page-0001.jpg" alt="Company Logo">
                    <h1>Order Status Update</h1>
                </div>
                <div class="content">
                    <p>Dear ${customer_name},</p>
                    <p>We would like to inform you that the status of your order (ID: #<strong>${order_id}</strong>) has been updated to: <strong>${order_status}</strong>.</p>
                    
                    <p>If you have any questions or need further assistance regarding your order, please feel free to contact our support team.</p>
                    
                    <p>Thank you for choosing our service!</p>
                    <p>Best regards,<br><strong>The Red Shift Team</strong></p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Red Shift. All rights reserved.</p>
                    <p>If you need assistance, <a href="mailto:${process.env.companymail}">contact support</a>.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
    
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });


    return  res.redirect(`/admin/order-details/${order_id}`);
    
  }



module.exports={
    loadLogin,
loadSignUp,
loadLogout,
errrorPage,
homePage,
loadCouponList,
loadGetUserList,


loadGetMainCategory,

loadGetProductsList,
loadGetProductsAdd,



loadGetOrdersOrderDetails,
loadGetOrdersOrderHistory,

loadEditService,
createAdmin,
loginAdmin,
logoutAdmin,
addUser,
getUsers,
userGetById,
userUpdate,
userDelete,
AdminAddProduct,
getAllProducts,
getProductById,
updateProduct,
deleteProduct,
createCategory,
getAllCategories,
deleteCategoryById,
createCoupon,
getAllCoupons,
deleteCouponById,
orderStatusUpdate,


}
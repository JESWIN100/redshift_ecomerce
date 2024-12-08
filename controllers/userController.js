const pool = require("../config/db/db.js");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");


 const loadAdmin = async (req, res) => {
    try {
      
        
        const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 8');

        const [categories] = await pool.query('SELECT * FROM category ORDER BY createdAt DESC LIMIT 4');
     


res.render('index', { products,categories });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

 const loadUserAboutUs = async (req, res) => {
    try {
        
        res.render('about-us');

    } catch (error) {
        console.log(error);
    }
}
 
 const loadUserProfile = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).send('Unauthorized: No session found.');
        }

        // Using parameterized query to prevent SQL injection
        const query = `SELECT id, name, email,phone,address,address2,address3, created_at FROM usermanagement WHERE id = ?`;
        const [rows] = await pool.execute(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = rows[0];
        console.log(user);
        
        res.render('user-profile',{user});

    } catch (error) {
        console.error('Error loading user profile:', error);
        res.status(500).send('Internal Server Error');
    }
}

 const loadUserHistory = async (req, res) => {
    const userId = req.session.user_id;

    // Ensure the user is authenticated before continuing
    if (!userId) {
        return res.status(403).json({ message: 'User is not authenticated.' });
    }

    try {
        // Fetch the payment details from the database for the current user
        const [paymentDetails] = await pool.query('SELECT * FROM payments WHERE user_id = ?', [userId]);
    

        
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
                    order_date:payment.crested_at
                };
            });
        }).flat();  // Flatten the array to handle multiple orders

        // Calculate the total amount for the current payment record
        const totalAmount = paymentDetails.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        // Pass additional order-related details if necessary
        const order = paymentDetails[0];

        console.log("Items:", paymentDetails);
     
        // Render the user history page with the payment items
        res.render('user-history', { products: items, totalAmount,paymentDetails:paymentDetails[0] });

    } catch (error) {
        // Log the error and return a generic message to the user
        console.error('Error loading user history:', error);
        return res.status(500).json({ message: error.message });
    }
};

 const loadUserContactUs = async (req, res) => {
    try {
        
        res.render('contact-us');

    } catch (error) {
        console.log(error);
    }
}
 const loadUserCart = async (req, res) => {
    try {

      
const userId = req.session.user_id

try {
    // Query to fetch cart items for the specific user
    const [cartItems] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);


    const total = cartItems.length;
    console.log(total);
    
    // Render the cart page with the user's cart items
    res.render('cart', { cartItems, total });
} catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).send('Error fetching cart items');
}


    } catch (error) {
        console.log(error);
    }
}
 const loadUserCheckout = async (req, res) => {
    try {
        const total = req.query.grandTotal;
       const itemQuantity= req.query.itemQuantity
    
    

        const user_id = req.session.user_id;

       
        if (!user_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const [cartItems] = await pool.query('SELECT * FROM payments WHERE user_id = ?', [user_id]);
    
 

        
        const sql = `
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `;
        const [orders] = await pool.query(sql, [user_id])
        // console.log(orders);
        
        res.render('checkout',{total,itemQuantity,adress:orders});

    } catch (error) {
        console.log(error);
    }
}
 const loadUserTerms = async (req, res) => {
    try {
        
        res.render('terms-condition');

    } catch (error) {
        console.log(error);
    }
}
 const loadUserPolicy = async (req, res) => {
    try {
        
        res.render('privacy-policy');

    } catch (error) {
        console.log(error);
    }
}


 const loadUserLogin = async (req, res) => {
    try {
        
        res.render('login');

    } catch (error) {
        console.log(error);
    }
}

 const loadUserSignup = async (req, res) => {
    try {
        
        res.render('register');

    } catch (error) {
        console.log(error);
    }
}

 const loadResetPassword = async (req, res) => {
    try {
        const token=req.params
        console.log(token);
        
        res.render('resetPassword',{token});

    } catch (error) {
        console.log(error);
    }
}


 const loadUserProductSide = async (req, res) => {
    try {
        const { category } = req.query;
        console.log("req.query", req.query);
        const page = parseInt(req.query.page) || 1
        // Start building the query
        let query = 'SELECT products.* FROM products';
        let params = [];

        // If a category is provided and it's not 'all', filter products based on category name
        if (category && category !== 'all') {
            query += ' JOIN category ON products.category_name = category.categoryName'; // Join with category table
            query += ' WHERE category.categoryName = ?'; // Filter products by categoryName from category table
            params.push(category);
        }
console.log("fvg",query);

        // Execute the query to fetch filtered products
        const [products] = await pool.query(query, params);

        // Query to fetch all categories for the sidebar
        const [categories] = await pool.query('SELECT * FROM category');

console.log("fghj",category);



        // Render the products and categories to the view
        res.render('product-left-sidebar', { products, categories,  page, });

    } catch (error) {
        console.error('Error fetching products:', error.message);
        return res.status(500).json({ message: error.message });
    }
}




 const loadUserProductBtid = async (req, res) => {
    try {



        const { id } = req.params; // Extract product ID from the request
        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }

        // Query database for the product
        const [results] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Extract the product
        const product = results[0];

        // Parse additional_images (if it's stored as a JSON string)
       // Parse additional_images and include image_url
let images = [];
try {
    if (product.additional_images) {
        images = JSON.parse(product.additional_images); // Parse additional images
    }
    if (product.image_url) {
        images.unshift(product.image_url); // Add the main image at the beginning
    }
} catch (e) {
    console.error("Failed to parse additional images:", e);
}


        const  category  = product.category_name
        console.log("req.query", req.query);
        const page = parseInt(req.query.page) || 1
        // Start building the query
        let query = 'SELECT products.* FROM products ';
        let params = [];

        // If a category is provided and it's not 'all', filter products based on category name
        if (category && category !== 'all') {
            query += ' JOIN category ON products.category_name = category.categoryName'; // Join with category table
            query += ' WHERE category.categoryName = ? ORDER BY created_at DESC LIMIT 4 '; // Filter products by categoryName from category table
            params.push(category);
        }
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Execute the query to fetch filtered products
        const [Relatedproducts] = await pool.query(query, params);

        const reviewQuery = 'SELECT * FROM reviews';
        const [reviews] = await pool.query(reviewQuery);

        // Filter reviews for the specific product
        const filteredReviews = reviews.filter((review) => {
            const [reviewProductId] = review.productName.split(':'); // Extract the ID from productName
            return parseInt(reviewProductId) === product.product_id; // Compare with the product ID
        });

    ////////////////////////////////////////////////////////////////////////////////////////////   

    const productId=id

    const avgReview = `
    SELECT AVG(rating) AS averageRating 
    FROM reviews 
    WHERE SUBSTRING_INDEX(productName, ':', 1) = ?`;

const [rows] = await pool.execute(avgReview, [productId]);

// Check if product has reviews
if (rows.length === 0 || rows[0].averageRating === null) {
    // return res.status(404).json({ message: "No reviews found for this product ID" });
}

const averageRating = rows[0].averageRating;


console.log(averageRating);



        // Render the view and pass the product data
        return res.render('product-right-sidebar', { product, images,Relatedproducts,filteredReviews,averageRating });
    } catch (error) {
        console.error("Error loading product:", error);
        return res.status(500).json({ error: error.message });
    }
};





 const addReview = async (req, res) => {
    const {  rating, comment, productName } = req.body;

    const user_id = req.session.user_id;

const [paymentDetails] = await pool.query('SELECT * FROM usermanagement WHERE id = ?', [user_id ]);


const name=paymentDetails[0].name
const email=paymentDetails[0].email


    try {
        const query = "INSERT INTO reviews (name, email, rating, comment, productName) VALUES (?, ?, ?, ?, ?)";
        await pool.execute(query, [name, email, rating, comment, productName]);

        res.redirect("/")
        // res.status(201).json({ message: "Review added successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};






 const addCart = async (req, res) => {
    const user_id = req.session.user_id;

    if (!user_id) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const { product_id, product_name, product_price, product_image } = req.body;

    try {
        // Check if the product already exists in the user's cart
        const [existingProduct] = await pool.query(
            `SELECT * FROM cart WHERE user_id = ? AND product_id = ?`,
            [user_id, product_id]
        );

        if (existingProduct.length > 0) {
            // If the product exists, update the quantity
            await pool.query(
                `UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?`,
                [user_id, product_id]
            );

            res.json({ success: true, message: "Product quantity updated in cart." });
        } else {
            // If the product does not exist, insert a new record
            await pool.query(
                `INSERT INTO cart (user_id, product_id, product_name, product_price, product_image, quantity)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, product_id, product_name, product_price, product_image, 1]
            );

           


            res.json({ success: true, message: "Product added to cart." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while adding to the cart." });
    }
};




 const getAverageRating = async (req, res) => {
    // const { productId } = req.params;
    const productId=11

    // Validate input
    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    try {
        // Fetch the average rating for the given product ID
        const query = `
            SELECT AVG(rating) AS averageRating 
            FROM reviews 
            WHERE SUBSTRING_INDEX(productName, ':', 1) = ?`;
        
        const [rows] = await pool.execute(query, [productId]);

        // Check if product has reviews
        if (rows.length === 0 || rows[0].averageRating === null) {
            return res.status(404).json({ message: "No reviews found for this product ID" });
        }

        const averageRating = rows[0].averageRating;

        res.status(200).json({
            productId: productId,
            averageRating: averageRating,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};




 const deleteCart = async (req, res) => {
    const { id } = req.params;
console.log(id);

    // Validate id
    if (!id) {
        return res.status(400).json({ message: "Invalid cart item ID" });
    }

    try {
        const query = 'DELETE FROM cart WHERE id = ?';
        const [results] = await pool.query(query, [id]);

        // Check if the item was actually deleted
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        // res.json("readyh")
        // Redirect or respond
        res.redirect('/cart');
    } catch (error) {
        console.error("Error deleting cart item:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the cart item",
            error: error.message,
        });
    }
};


const logo="/assets/images/logo/LOGO DESIGN RED SHIFT _page-0001.jpg"
let mail=process.env.companymail


 const register= async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if required fields are provided
        if (!name || !email || !phone || !password) {
            req.flash('error', 'First Name, Email, Phone Number, and Password are required');
            return res.redirect('/sign-up'); 
        }

        // Check if email already exists in the database
        const [existingEmail] = await pool.query('SELECT * FROM userManagement WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            req.flash('error', 'Email is already registered');
            return res.redirect('/sign-up'); // Redirect back with an erro
        }

        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Insert the new user into the database
        const query = `INSERT INTO userManagement (name, email, phone, password) VALUES (?, ?, ?, ?)`;
        const [results] = await pool.query(query, [name, email, phone, hashedPassword]);


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
            to: email,
            subject: 'Welcome to Our Service!',
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
                    .content p {
                        line-height: 1.6;
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
                        <img src=${logo} alt="Company Logo">
                        <h1>Welcome to Our Service!</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${name},</p>
                        <p>Thank you for registering with us! We are thrilled to have you on board. We look forward to helping you get started and provide you with excellent service.</p>
                        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                        <p>Best regards,</p>
                        <p><strong>The Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                        <p>Need help? <a href="mailto:${mail}">Contact support</a></p>
                    </div>
                </div>
            </body>
            </html>
            `
        };
        
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                req.flash('error', 'An error occurred while sending the welcome email. Please try again later.',error);
            } else {
                console.log('Email sent:', info.response);
            }
        });




        // Redirect or send success response after registration
        res.redirect("/login?success=true");  // You can also send a success response like below:
        // return res.status(201).json({
        //     message: 'User registered successfully!',
        //     user: {
        //         id: results.insertId,
        //         name,
        //         email,
        //         phone
        //     }
        // });

    } catch (error) {
        req.flash(error.message);
        return res.redirect('/sign-up');
    }
}





 const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            req.flash('error', 'Email and password are required');
            return res.redirect('/login'); // Redirect back to login page with error message
        }

        // Check if the user exists in the database
        const [userResult] = await pool.query('SELECT * FROM userManagement WHERE email = ?', [email]);
        if (userResult.length === 0) {
            req.flash('error', 'User not found');
            return res.redirect('/login'); // Redirect back with error message
        }

        const user = userResult[0];

        // Compare the provided password with the stored hashed password 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/login'); // Redirect back with error message
        }

        // If the credentials match, store user session (using session ID)
        req.session.user_id = user.id;
        console.log("User logged in, session ID: ", req.session.user_id);

        // If a session-based redirect URL exists, use it; otherwise, go to the home page
        const redirectUrl = req.session.originalUrl || '/';
        console.log("Redirecting to: ", redirectUrl);

        // Clear the original URL from the session after redirect
        delete req.session.originalUrl;

      
        // Redirect to the intended page or home page
        res.redirect(redirectUrl);


    } catch (error) {
        
        req.flash(error.message);
        return res.redirect('/login'); // Redirect with error message if something goes wrong
    }
};



 const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many password reset requests from this IP, please try again later."
});
 const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if the user exists
        const [userResult] = await pool.query('SELECT * FROM userManagement WHERE email = ?', [email]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

       
        const user = userResult[0];

        // Generate a secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token expiration (e.g., 1 hour from now)
        const expiration = new Date(Date.now() + 3600000);

        // Store token in the database
        await pool.query(
            'UPDATE userManagement SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
            [hashedToken, expiration, user.id]
        );

        // Send email with reset link
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Use your email provider
            auth: {
                user: process.env.Nodemailer_User, 
                pass: process.env.Nodemailer_Pass  
            }
        });

        const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

        
        const message = `
            <p>You have requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: message
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error during password reset request:', error.message);
        return res.status(500).json({ message: error.message });
    }
};




// Route to handle the password reset logic
 const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const [userResult] = await pool.query(
            'SELECT * FROM userManagement WHERE resetToken = ? AND resetTokenExpiry > ?',
            [hashedToken, new Date()]
        );

        if (userResult.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const user = userResult[0];

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE userManagement SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error during password reset:', error.message);
        return res.status(500).json({ message: error.message });
    }
};















 const logout = (req, res, next) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error while signing out:', err);
          return res.status(500).send('Error occurred during signout.');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/'); 
      });
    } catch (error) {
      console.log(error.message);
  
    }
  }


 const updateCartQuantity = async (req, res) => {
    const { quantity } = req.body;
    const {productId} = req.params
console.log(quantity);
console.log(productId);


    // Validate input
    if (!productId || quantity === undefined) {
        return res.status(400).json({ success: false, message: "Product ID and quantity are required." });
    }

    if (quantity < 0) {
        return res.status(400).json({ success: false, message: "Quantity must be 0 or greater." });
    }

    try {
        const checkQuery = `SELECT quantity FROM cart WHERE id = ?`;
        const [existingProduct] = await pool.execute(checkQuery, [productId]);

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found in cart." });
        }

        if (quantity === 0) {
            const deleteQuery = `DELETE FROM cart WHERE id = ?`;
            await pool.execute(deleteQuery, [productId]);
            return res.json({ success: true, message: "Product removed from cart." });
        }

        const updateQuery = `UPDATE cart SET quantity = ? WHERE id = ?`;
        await pool.execute(updateQuery, [quantity, productId]);

        res.json({ success: true, message: "Product quantity updated successfully." });
    } catch (error) {
        console.error("Error updating product quantity:", error);
        res.status(500).json({ success: false, message: error.message});
    }
};
// router.get('/search', 

 const search = async (req, res) => {
    try {
      const { searchTerm } = req.query;
  console.log("search",searchTerm);
  
      if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
      }
  
      const query = `
        SELECT * FROM products
        WHERE product_name LIKE ? OR
              category_name LIKE ?
      `;
      const searchValue = `%${searchTerm}%`;
      const [results] = await pool.query(query, [searchValue, searchValue, searchValue]);
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'No products found' });
      }
  
      return res.status(200).json({ products: results });
    } catch (error) {
      console.error('Error searching for products:', error.message);
      return res.status(500).json({ message: error.message });
    }
  };
  




 const Paymentcheckout = async (req, res) => {
    try {
        // Validate user authentication
        const user_id = req.session.user_id
        


        if (!user_id) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        // Destructure request body
        const {
            firstname,
            lastname,
            address,
            ec_select_city,
            postalcode,
            ec_select_country,
            ec_select_state,
            payment_method,
            total_amount,
        } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !address || !ec_select_city || !postalcode || !ec_select_country ||  !user_id ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // SQL query
        const sql = `
            INSERT INTO orders 
            (user_id, first_name, last_name, address, city, postal_code, country, region_state, payment_method, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            user_id,
            firstname,
            lastname,
            address,
            ec_select_city,
            postalcode,
            ec_select_country,
            ec_select_state,
            payment_method,
            total_amount || 0.0,
        ];

        // Execute SQL query
        await pool.query(sql, values);

        // Respond with success
        res.json({ success: true, message: "Order placed successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};


 const validateCoupon = async (req, res) => {
    const { couponcode } = req.body;

    if (!couponcode) {
        return res.status(400).json({ message: 'Coupon code is required.' });
    }

    try {
        // Check if the coupon exists and retrieve the discount
        const [coupon] = await pool.query('SELECT * FROM coupons WHERE couponcode = ?', [couponcode]);

        if (coupon.length === 0) {
            return res.status(404).json({ message: 'Invalid coupon code.' });
        }

        // Send the discount value as a response
        res.status(200).json({ discount: coupon[0].discount });

    } catch (error) {
        console.error('Error during coupon validation:', error.message);
        return res.status(500).json({ message: error.message });
    }
};


  const contactUS=(req, res) => {
   try {
    const { firstname, lastname, email, phonenumber, address } = req.body;

    if (!firstname || !lastname || !email) {
        req.flash('error', 'Please fill in all required fields.');
        return res.redirect('/contact-us'); // Redirect back with error message
    }

    const query = "INSERT INTO contacts (firstname, lastname, email, phonenumber, comments) VALUES (?, ?, ?, ?, ?)";
    pool.query(query, [firstname, lastname, email, phonenumber, address])
      


    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.Nodemailer_User, 
            pass: process.env.Nodemailer_Pass    
        }
    });

    const userMailOptions = {
        from: process.env.Nodemailer_User, // Admin email as sender
        to: email, // User's email
        subject: 'Thank you for reaching out to us!',
        html: `
            <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
                        h1 { color: #2c3e50; font-size: 24px; }
                        p { font-size: 16px; }
                        .footer { font-size: 14px; color: #7f8c8d; }
                        .footer a { color: #2980b9; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>Dear ${firstname} ${lastname},</h1>
                    <p>Thank you for contacting us. We have received your message and will get back to you shortly. Below are the details you provided:</p>
                    <ul>
                        <li><strong>Full Name:</strong> ${firstname} ${lastname}</li>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Phone Number:</strong> ${phonenumber || 'Not provided'}</li>
                        <li><strong>Address:</strong> ${address || 'Not provided'}</li>
                    </ul>
                    <p>If you have any further questions, feel free to reply to this email.</p>
                    <p class="footer">Best regards, <br> ${process.env.Nodemailer_User}</p>
                </body>
            </html>
        `
    };

    // Mail to the admin (the hosted person)
    const adminMailOptions = {
        from: email, // User's email as the sender
        to: process.env.Nodemailer_User, // Admin email
        subject: 'New Contact Form Submission',
        html: `
            <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
                        h1 { color: #2c3e50; font-size: 24px; }
                        p { font-size: 16px; }
                        .email-details { background-color: #f4f4f4; border-radius: 5px; padding: 10px; }
                        .email-details strong { color: #2c3e50; }
                    </style>
                </head>
                <body>
                    <h1>New Contact Form Submission</h1>
                    <p>A new contact form submission has been received. Below are the details:</p>
                    <div class="email-details">
                        <ul>
                            <li><strong>Full Name:</strong> ${firstname} ${lastname}</li>
                            <li><strong>Email:</strong> ${email}</li>
                            <li><strong>Phone Number:</strong> ${phonenumber || 'Not provided'}</li>
                            <li><strong>Address:</strong> ${address || 'Not provided'}</li>
                        </ul>
                    </div>
                    <p>Please review and follow up with the user accordingly.</p>
                    <p class="footer">Best regards, <br> ${process.env.Nodemailer_User}</p>
                </body>
            </html>
        `
    };
    
    // Send the email
    transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
            req.flash(error);
        } else {
            req.flash(info.response);
        }
    });

    transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
            req.flash(error);
        } else {
            req.flash(info.response);
        }
    });

       return res.redirect("/contact-us?success=true");
       
    
   } catch (error) {

    req.flash(error.message);
    return res.redirect('/contact-us');
   }
}



 const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY_ID,
  });



 const createPayment =async (req, res) => {
    const { amount, currency,items,firstname, lastname, address, city, postalcode, country, state, payment_method } = req.body;

    const userId = req.session.user_id
    // Basic validation for the request body

    const [cartItems] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
    // console.log(cartItems); 



    const [userdetails] = await pool.query('SELECT * FROM usermanagement WHERE id = ?', [userId]);

    const name=userdetails[0]
    


    // Step 2: Format the cart items for storage (e.g., image, quantity)
    const serializedItems = cartItems.map(item => {
        return `${item.product_id}|${item.product_name}|${item.product_price}|${item.product_image}|${item.quantity}`;
    }).join(',');

console.log("serializedItems",serializedItems);



    if (!amount || !currency) {
        return res.status(400).json({ error: 'Amount and currency are required' });
    }


    try {
        const options = {
            amount: amount * 100, // Convert amount to paise (1 INR = 100 paise)
            currency: currency,
            receipt: 'receipt#1',
            payment_capture: 1, // Capture payment immediately
        };

      
        // Call Razorpay to create the order
        razorpayInstance.orders.create(options, (err,order) => {
            if (err) {
                console.error('Razorpay Order Creation Error:', err); // Log the full error for better debugging
                 res.status(500).json({ error: 'Failed to create payment order', details: err });
            }
           
            

            // If Razorpay order creation is successful, store order details in MySQL
            const query = 'INSERT INTO payments (order_id, amount, currency,user_id,items,firstname,lastname,address,city,postalcode,country,state,payment_method) VALUES (?, ?, ?,?,?,?,?,?,?,?,?,?,?)';
            pool.query(query, [order.id,
                 amount,
                  currency,
                  userId,
                  serializedItems,
                   firstname,
                   lastname,
                   address,
                   city,
                   postalcode,
                   country,
                   state,
                   payment_method
                ])

if(payment_method==="Cash On Delivery"){





    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Nodemailer_User,
            pass: process.env.Nodemailer_Pass,
        },
    });

    const userMailOptions = {
        from: process.env.Nodemailer_User, // Admin email as sender
        to: name.email,  // Replace with user details email
        subject: 'Payment Successful! Thank You for Your Purchase',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
                <div style="background-color: #ffffff; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #f4a623; padding: 20px; text-align: center; position: relative;">
                        <img src="https://cdn3.iconfinder.com/data/icons/basicolor-arrows-checks/24/155_check_ok_sticker_success-512.png" alt="Checkmark icon" style="width: 50px; height: 50px;" />
                       <h2 style="font-size: 18px; color: #000000;">Order Successfully Placed</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h2 style="font-size: 18px; color: #000000;">Dear ${name.name},</h2>
                        <p style="font-size: 16px; color: #333333;">Thank you for your recent purchase from our store. We are pleased to inform you that your payment was successfully processed.</p>
                        <h3 style="font-size: 20px; color: #000000;">Order Details:</h3>
                        <ul style="list-style-type: none; padding-left: 0;">
                            ${cartItems.map(item => `
                                <li style="margin-bottom: 20px;">
                                    <strong>Product Name:</strong> ${item.product_name}<br>
                                    <strong>Quantity:</strong> ${item.quantity}<br>
                                    <strong>Price:</strong> AED ${item.product_price}<br>
                                    <img src="${item.product_image}" alt="${item.product_name}" style="width: 100px;"/>
                                </li>
                            `).join('')}
                        </ul>
                        <p style="font-size: 16px; color: #333333;">Your items will be shipped shortly. Thank you for shopping with us!</p>
                        <p style="font-size: 16px; color: #333333;">If you have any questions or need assistance, feel free to reach out.</p>
                        <p style="font-size: 16px; color: #333333;">Best regards,<br>The Team Red Shift</p>
                    </div>
                   
                          
                        </div>
                    </div>
                </div>
            </div>
        `,
    };
    

    // Send the email
    transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });














     pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
}

                // Successfully inserted into the database, return order ID
                return res.json({
                    success: true,
                    orderId: order.id
                });
            });
        
    } catch (error) {
        console.error('Unexpected Error:', error); // Log unexpected errors
        return res.status(500).send({ error: 'Internal server error', details: error });
    }
};

  const razorpaySecret=process.env.RAZORPAY_SECRET_KEY_ID;
 
   const verifyPayment = async (req, res) => {
    const { paymentId, orderId, signature } = req.body;
    const userId = req.session.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'User not authenticated' });
    }

    try {
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto.createHmac('sha256', razorpaySecret).update(body).digest('hex');

        if (expectedSignature === signature) {
            // Signature matches, update payment as successful
            await pool.query('UPDATE payments SET payment_status = ?, payment_id = ? WHERE order_id = ?', [
                'success',
                paymentId,
                orderId,
            ]);
            
            const [userdetails] = await pool.query('SELECT * FROM usermanagement WHERE id = ?', [userId]);

const name=userdetails[0]


            const [cartItems] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
            const serializedItems = cartItems.map(item => {
                return `${item.product_id}|${item.product_name}|${item.product_price}|${item.product_image}|${item.quantity}`;
            }).join(',');

            // Step 2: Send email to user
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.Nodemailer_User,
                    pass: process.env.Nodemailer_Pass,
                },
            });

            const userMailOptions = {
                from: process.env.Nodemailer_User, // Admin email as sender
                to: name.email,  // Replace with user details email
                subject: 'Payment Successful! Thank You for Your Purchase',
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">
                        <div style="background-color: #ffffff; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                            <div style="background-color: #f4a623; padding: 20px; text-align: center; position: relative;">
                                <img src="https://cdn3.iconfinder.com/data/icons/basicolor-arrows-checks/24/155_check_ok_sticker_success-512.png" alt="Checkmark icon" style="width: 50px; height: 50px;" />
                                <h2 style="font-size: 18px; color: #000000;">Order Successfully Placed</h2>
                            </div>
                            <div style="padding: 20px;">
                                <h2 style="font-size: 18px; color: #000000;">Dear ${name.name},</h2>
                                <p style="font-size: 16px; color: #333333;">Thank you for your recent purchase from our store. We are pleased to inform you that your payment was successfully processed.</p>
                                <h3 style="font-size: 20px; color: #000000;">Order Details:</h3>
                                <ul style="list-style-type: none; padding-left: 0;">
                                    ${cartItems.map(item => `
                                        <li style="margin-bottom: 20px;">
                                            <strong>Product Name:</strong> ${item.product_name}<br>
                                            <strong>Quantity:</strong> ${item.quantity}<br>
                                            <strong>Price:</strong> AED ${item.product_price}<br>
                                            <img src="${item.product_image}" alt="${item.product_name}" style="width: 100px;"/>
                                        </li>
                                    `).join('')}
                                </ul>
                                <p style="font-size: 16px; color: #333333;">Your items will be shipped shortly. Thank you for shopping with us!</p>
                                <p style="font-size: 16px; color: #333333;">If you have any questions or need assistance, feel free to reach out.</p>
                                <p style="font-size: 16px; color: #333333;">Best regards,<br>The Team Red Shift</p>
                            </div>
                           
                                  
                                </div>
                            </div>
                        </div>
                    </div>
                `,
            };
            

            // Send the email
            transporter.sendMail(userMailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

            // Clear user's cart
            await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);




            

            return res.json({ success: true, message: 'Payment verified and status updated' });
        } else {
            // Signature mismatch, update payment as failed
            await pool.query('UPDATE payments SET payment_status = ?, payment_id = ? WHERE order_id = ?', [
                'failed',
                paymentId,
                orderId,
            ]);

            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (err) {
        console.error('Error processing payment verification:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



 const updateUser = async (req, res) => {
    try {
        const { name, email, phone, address,address2,address3 } = req.body; // Get the input data
        const userId = req.session.user_id; // Get user ID from the session

        if (!userId) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        // Build the update query dynamically based on provided fields
        const fieldsToUpdate = [];
        const values = [];

        if (name) {
            fieldsToUpdate.push("name = ?");
            values.push(name);
        }
        if (email) {
            fieldsToUpdate.push("email = ?");
            values.push(email);
        }
        if (phone) {
            fieldsToUpdate.push("phone = ?");
            values.push(phone);
        }
        if (address) {
            fieldsToUpdate.push("address = ?");
            values.push(address);
        }
        if (address2) {
            fieldsToUpdate.push("address2 = ?");
            values.push(address2);
        }
        if (address3) {
            fieldsToUpdate.push("address3 = ?");
            values.push(address3);
        }
        // If no fields to update, respond with a message
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        // Add userId to the values array for the WHERE clause
        values.push(userId);

        // Construct the final SQL query
        const query = `UPDATE userManagement SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

        // Execute the query
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or no changes made" });
        }

        // Redirect or respond with success
        res.redirect("/profile?success=true");
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports={
    

loadAdmin,
loadUserAboutUs,

loadUserProfile,
loadUserHistory,
loadUserContactUs,
loadUserCheckout,
loadUserTerms,
loadUserPolicy,

loadUserLogin,
loadUserSignup,

loadResetPassword,
loadUserProductSide,
loadUserProductBtid,
addReview,
addCart,
getAverageRating,
deleteCart,
register,
loginUser,
resetPasswordLimiter,
requestPasswordReset,
resetPassword,
logout,
updateCartQuantity,
search,
Paymentcheckout,
validateCoupon,
contactUS,
loadUserCart,
razorpayInstance,
createPayment,
verifyPayment,
updateUser








}
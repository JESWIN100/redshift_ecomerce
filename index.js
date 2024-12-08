const express =require ('express');

const morgan =require ('morgan');
const adminRoute =require ('./routes/adminRoute.js')
const path =require ('path')
const { fileURLToPath } =require ('url');
const expressLayouts =require ('express-ejs-layouts')
const userRoute =require ('./routes/userRoute.js');
const flash =require( 'express-flash')

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));

app.use(flash());

app.set('view engine', 'ejs');
app.use('/uploads', express.static('upload'));

// Routes
app.use('/',userRoute);

app.use('/admin',adminRoute);


app.use((req, res) => {
  res.status(404).render('404');
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

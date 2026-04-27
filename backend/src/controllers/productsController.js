import Product from "../models/products.js"; // Modelo de productos
import HttpResponses from "../traits/HttpResponses.js"; // manejador de respuestas HTTP

const productsController = {}; // objeto controlador para productos

// Controlador para manejar la ruta GET /api/products
productsController.getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // obtenemos todos los productos
    return HttpResponses.ok(res, products, "Productos obtenidos correctamente"); // respondemos con los productos y mensaje de éxito
  } catch (error) {
    return HttpResponses.serverError( // manejamos errores inesperados con un 500
      res,
      "Error al obtener los productos",
      error.message,
    );
  }
};

// Controlador para manejar la ruta GET /api/products/:id
productsController.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // obtenemos el producto por ID
    if (!product) { // si no existe el producto, respondemos con un 404
      return HttpResponses.notFound(res, "Producto no encontrado");
    }
    return HttpResponses.ok(res, product, "Producto obtenido correctamente"); // respondemos con el producto y mensaje de éxito
  } catch (error) {
    return HttpResponses.serverError( // manejamos errores inesperados con un 500
      res,
      "Error al obtener el producto",
      error.message,
    );
  }
};

// Controlador para manejar la ruta POST /api/products
productsController.postProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.validatedBody; // obtenemos los datos
    const newProduct = new Product({ name, description, price, stock }); // creamos una nueva instancia del producto con los datos recibidos
    const savedProduct = await newProduct.save(); // guardamos el producto

    if (savedProduct) { // si se guardó correctamente, respondemos con un 201
      return HttpResponses.created(
        res,
        savedProduct,
        "Producto creado correctamente",
      );
    }
  } catch (error) { // manejamos errores inesperados con un 500
    return HttpResponses.serverError(
      res,
      "Error al crear el producto",
      error.message,
    );
  }
};

// Controlador para manejar la ruta PUT /api/products/:id
productsController.putProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate( // actualizamos el producto por ID con los datos validados
      req.params.id, // ID del producto a actualizar
      req.validatedBody, // datos validados para actualizar el producto
      { new: true }, // opción para devolver el documento actualizado en lugar del original
    );
    if (!updatedProduct) { // si no existe el producto, respondemos con un 404
      return HttpResponses.notFound(res, "Producto no encontrado");
    }
    return HttpResponses.ok( // respondemos con el producto actualizado y mensaje de éxito
      res,
      updatedProduct,
      "Producto actualizado correctamente",
    );
  } catch (error) {
    return HttpResponses.serverError( // manejamos errores inesperados con un 500
      res,
      "Error al actualizar el producto",
      error.message,
    );
  }
};

productsController.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id); // eliminamos el producto por ID
    if (!deletedProduct) { // si no existe el producto, respondemos con un 404
      return HttpResponses.notFound(res, "Producto no encontrado");
    }
    return HttpResponses.ok( // respondemos con el producto eliminado y mensaje de éxito
      res,
      deletedProduct,
      "Producto eliminado correctamente",
    );
  } catch (error) {
    return HttpResponses.serverError( // manejamos errores inesperados con un 500
      res,
      "Error al eliminar el producto",
      error.message,
    );
  }
};

export default productsController; // exportamos el controlador para usarlo en las rutas

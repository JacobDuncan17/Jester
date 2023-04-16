const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
    const productData = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['id', 'category_name']
        },
        {
          model: Tag,
          attributes: ['id', 'tag_name'],
          through: ProductTag,
          as: 'tags'
        }
      ]
    });
    res.status(200).json(productData);
});

router.get('/:id', async (req, res) => {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }
    res.status(200).json(productData);
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length > 0) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', (req, res) => {
  
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    })
});

module.exports = router;

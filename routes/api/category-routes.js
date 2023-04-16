const router = require('express').Router();
const { restart } = require('nodemon');
const { Category, Product } = require('../../models');

router.get('/', async(req, res) => {
    const allCategories = await Category.findAll({
      include: [{ model: Product}],
    });
    res.status(200).json(allCategories);
});

router.get('/:id', async(req, res) => {
    const categoryId = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!categoryId) {
      res.status(404).json({ message: 'There is not a category found with this id'});
      return;
    }
    res.status(200).json(categoryId);
});

router.post('/', async (req, res) => {
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory);
});

router.put('/:id', (req, res) => {
  Category.update(req.body, { where: { id: req.params.id } })
    .then(() => {
      return Category.findOne({
        where: { id: req.params.id },
        include: [{ model: Product }],
      });
    })
    .then((category) => {
      res.status(200).json(category);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
  .then(() =>{
    res.status(200).json({ message: 'Category has been deleted'})
  })
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  })
});

module.exports = router;
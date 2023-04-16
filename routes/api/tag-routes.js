const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

router.get('/', (req, res) => {
  Tag.findAll({
    include: [{ model: Product, through: ProductTag }]
  })
    .then(tags => res.json(tags))
    .catch(err => res.status(500).json(err));
});

router.get('/:id', (req, res) => {
  Tag.findByPk(req.params.id, {
    include: [{ model: Product, through: ProductTag}]
  })
    .then(tag => {
      if(!tag) {
        res.status(404).json({ message: 'There was no tag with this id found'});
        return;
      }
      res.json(tag);
    })
    .catch(err => res.status(500).json(err));
});

router.post('/', (req, res) => {
  Tag.create(req.body)
    .then(tag => res.status(201).json(tag))
    .catch(err => res.status(500).json(err));
});

router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    where: { id: req.params.id }
  })
    .then(tag => {
      if(!tag[0]) {
        res.status(404).json({ message: 'There was no tag with this id found'});
        return;
      }
      res.status(200).json({ message: `Tag ${req.params.id} has been updated successfully`});
    })
    .catch(err => res.status(500).json(err));
});

router.delete('/:id', (req, res) => {
  Tag.destroy({
    where: { id: req.params.id }
  })
    .then(tag => {
      if(!tag) {
        res.status(404).json({ message: 'There was no tag with this id found'});
        return;
      }
      res.status(200).json({ message: `Tag ${req.params.id} has been deleted` });
    })
    .catch(err => res.status(500).json(err));
});

module.exports = router;

export function MenuItem(name, brand, calories, protein, carbohydrates, fat) {
  this.name = name;
  this.brand = brand;
  this.calories = calories;
  this.protein = protein;
  this.carbohydrates = carbohydrates;
  this.fat = fat;
}

export function IdealMenuItem(
  name,
  brand,
  calories,
  protein,
  carbohydrates,
  fat
) {
  MenuItem.call(this, name, brand, calories, protein, carbohydrates, fat);
  this.closestItem = null;
  this.minimumDelta = Infinity;
}

MenuItem.prototype = Object.create(IdealMenuItem.prototype);
IdealMenuItem.prototype.constructor = IdealMenuItem;

IdealMenuItem.prototype.SetClosestItem = function (MenuItems) {
  for (let i = 0; i < MenuItems.length; i++) {
    let delta = Math.sqrt(
      (this.calories - MenuItems[i].calories) ** 2 +
        (this.protein - MenuItems[i].protein) ** 2 +
        (this.carbohydrates - MenuItems[i].carbohydrates) ** 2 +
        (this.fat - MenuItems[i].fat) ** 2
    );
    if (this.minimumDelta > delta) {
      this.minimumDelta = delta;
      this.closestItem = MenuItems[i];
    }
  }
};

IdealMenuItem.prototype.GetClosestItem = function () {
  return this.closestItem;
};

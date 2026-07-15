/**
 * ApiFeatures - chainable query builder for MongoDB
 * Usage:
 *   const features = new ApiFeatures(Model.find(), req.query)
 *     .search('name description')
 *     .filter()
 *     .sort()
 *     .paginate();
 *   const docs = await features.query;
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Text search on specified fields
  search(fields = 'name') {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const fieldArray = fields.split(' ');
      const orConditions = fieldArray.map((f) => ({ [f]: searchRegex }));
      this.query = this.query.find({ $or: orConditions });
    }
    return this;
  }

  // Filter by any field (excludes pagination/sort/search)
  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ['page', 'limit', 'sort', 'search', 'fields'];
    excluded.forEach((el) => delete queryObj[el]);

    // Convert gt/gte/lt/lte to MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sort results
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Paginate results
  paginate(defaultLimit = 12) {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || defaultLimit;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = ApiFeatures;

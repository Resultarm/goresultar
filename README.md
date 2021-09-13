# goresultar

## Main UI libraries

```
antd (https://ant.design/components/overview/)
semantic-ui-react (https://react.semantic-ui.com/)
```

Running following will print CSV headers

```
mongo gerenciador < get_columns.js
```

portuguese translation file location: `web/public/locales/pt/translation.json`

headers:

```
departments ->>  _id,createdAt,deletedAt,description,organizationId,title
categories ->>  _id,department,departmentId,description,organizationId,title
subcategories ->>  _id,category,categoryId,deletedAt,description,organizationId,title
brands ->>  _id,createdAt,departmentId,description,organizationId,title
models ->>  _id,brand,brandId,description,organizationID,organizationId,title
products ->>  _id,brandId,categoryId,comment,cost,createdAt,deletedAt,departmentId,description,images,minStockThreshold,modelId,organizationId,price,productIds,sellBy,status,subcategoryId,title,totalUnits,unit,unitType
orders ->>  _id,clientId,comment,createdAt,deletedAt,documents,estConclusionDate,items,orderId,organizationId,processStatus,status,userId
```

### Build

Build backend using (Requires Go 13+):

```
go build  -o gerenciador cmd/*
```

Build frontend using (Require NodeJS 12+):

```
cd web
npm run build
```

### Initial Setup

After installing mongodb, run

```
mongo gerenciador < setup_superadmin.js
```

Start Backend using

```
go run cmd/*
```

Start frontend using

```
cd web
npm start
```

### Nginx Configuration

copy the content of file `nginx.conf.template` to your nginx (default: `/etc/nginx/nginx.conf`) file.
and restart nginx using `nginx restart`

- https://codesandbox.io/s/currency-wrapper-antd-input-3ynzo
- https://stackoverflow.com/questions/4057196/how-do-you-query-for-is-not-null-in-mongo
- https://stackoverflow.com/questions/6851933/how-to-remove-a-field-completely-from-a-mongodb-document
- https://stackoverflow.com/questions/33413294/mongo-aggregation-group-and-project-array-to-object-for-counts
- https://stackoverflow.com/questions/17044587/how-to-aggregate-sum-in-mongodb-to-get-a-total-count
- https://stackoverflow.com/questions/48235279/mongodb-sum-with-condition
- https://stackoverflow.com/questions/49687020/mongodb-aggregation-push-if-conditional
- https://stackoverflow.com/questions/37014762/
- https://stackoverflow.com/questions/37691727/how-to-use-mongodbs-aggregate-lookup-as-findone
- https://stackoverflow.com/questions/16662405/mongo-group-query-how-to-keep-fields
- https://stackoverflow.com/questions/33134523/mongodb-group-by-values-in-an-array-field
- https://stackoverflow.com/questions/40992111/mongodb-join-data-inside-an-array-of-objects
- https://stackoverflow.com/questions/49491235/need-to-sum-from-array-object-value-in-mongodb
- https://stackoverflow.com/questions/48847800/mongo-db-aggregation-array-size-greater-than-match
- https://blog.depa.do/post/gin-validation-errors-handling
- https://medium.com/@seb.nyberg/better-validation-errors-in-go-gin-88f983564a3d
- https://observablehq.com/@kelleyvanevert/projection-of-3d-models-using-javascript-and-html5-canvas#modelVerts
- https://www.basedesign.com/blog/how-to-render-3d-in-2d-canvas

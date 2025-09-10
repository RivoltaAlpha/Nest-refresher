# Relations

## What are relations?

Relations helps you to work with related entities easily.
There are several types of relations:

-   one-to-one using `@OneToOne`
-   many-to-one using `@ManyToOne`
-   one-to-many using `@OneToMany`
-   many-to-many using `@ManyToMany`

## Relation options

There are several options you can specify for relations:

-   `eager: boolean` (default: `false`) - If set to true, the relation will always be loaded with the main entity when using `find*` methods or `QueryBuilder` on this entity
-   `cascade: boolean | ("insert" | "update")[]` (default: `false`) - If set to true, the related object will be inserted and updated in the database. You can also specify an array of [cascade options](#cascade-options).
-   `onDelete: "RESTRICT"|"CASCADE"|"SET NULL"` (default: `RESTRICT`) - specifies how foreign key should behave when referenced object is deleted
-   `nullable: boolean` (default: `true`) - Indicates whether this relation's column is nullable or not. By default it is nullable.

## `@JoinColumn` options

`@JoinColumn` not only defines which side of the relation contains the join column with a foreign key,
but also allows you to customize join column name and referenced column name.

When we set `@JoinColumn`, it automatically creates a column in the database named `propertyName + referencedColumnName`.
For example:

```typescript
@ManyToOne(type => Category)
@JoinColumn() // this decorator is optional for @ManyToOne, but required for @OneToOne
category: Category;
```

This code will create a `categoryId` column in the database.
If you want to change this name in the database you can specify a custom join column name:

```typescript
@ManyToOne(type => Category)
@JoinColumn({ name: "cat_id" })
category: Category;
```

Join columns are always a reference to some other columns (using a foreign key).
By default your relation always refers to the primary column of the related entity.
If you want to create relation with other columns of the related entity -
you can specify them in `@JoinColumn` as well:

```typescript
@ManyToOne(type => Category)
@JoinColumn({ referencedColumnName: "name" })
category: Category;
```

The relation now refers to `name` of the `Category` entity, instead of `id`.
Column name for that relation will become `categoryName`.

You can also join multiple columns. Note that they do not reference the primary column of the related entity by default: you must provide the referenced column name.

```typescript
@ManyToOne(type => Category)
@JoinColumn([
    { name: "category_id", referencedColumnName: "id" },
    { name: "locale_id", referencedColumnName: "locale_id" }
])
category: Category;
```

## `@JoinTable` options

`@JoinTable` is used for `many-to-many` relations and describes join columns of the "junction" table.
A junction table is a special separate table created automatically by TypeORM with columns that refer to the related entities.
You can change column names inside junction tables and their referenced columns with `@JoinColumn`:
You can also change the name of the generated "junction" table.

```typescript
@ManyToMany(type => Category)
@JoinTable({
    name: "question_categories", // table name for the junction table of this relation
    joinColumn: {
        name: "question",
        referencedColumnName: "id"
    },
    inverseJoinColumn: {
        name: "category",
        referencedColumnName: "id"
    }
})
categories: Category[];
```

If the destination table has composite primary keys,
then an array of properties must be sent to `@JoinTable`.


# One-to-one relations

One-to-one is a relation where A contains only one instance of B, and B contains only one instance of A.
Let's take for example `User` and `Profile` entities.
User can have only a single profile, and a single profile is owned by only a single user.

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    gender: string

    @Column()
    photo: string
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Profile } from "./Profile"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile
}
```

Here we added `@OneToOne` to the `user` and specified the target relation type to be `Profile`.
We also added `@JoinColumn` which is required and must be set only on one side of the relation.
The side you set `@JoinColumn` on, that side's table will contain a "relation id" and foreign keys to the target entity table.

This example will produce the following tables:

```shell
+-------------+--------------+----------------------------+
|                        profile                          |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| gender      | varchar(255) |                            |
| photo       | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
| profileId   | int(11)      | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

**Again, `@JoinColumn` must be set only on one side of the relation - the side that must have the foreign key in the database table.**

Relations can be uni-directional and bi-directional.
Uni-directional are relations with a relation decorator only on one side.
Bi-directional are relations with decorators on both sides of a relation.

We just created a uni-directional relation. Let's make it bi-directional:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    gender: string

    @Column()
    photo: string

    @OneToOne(() => User, (user) => user.profile) // specify inverse side as a second parameter
    user: User
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Profile } from "./Profile"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToOne(() => Profile, (profile) => profile.user) // specify inverse side as a second parameter
    @JoinColumn()
    profile: Profile
}
```

We just made our relation bi-directional. Note, inverse relation does not have a `@JoinColumn`.
**`@JoinColumn` must only be on one side of the relation - on the table that will own the foreign key.**

Bi-directional relations allow you to join relations from both sides using `QueryBuilder`:

```typescript
const profiles = await dataSource
    .getRepository(Profile)
    .createQueryBuilder("profile")
    .leftJoinAndSelect("profile.user", "user")
    .getMany()
```

# Many-to-one / one-to-many relations

**Many-to-one / one-to-many is a relation where A contains multiple instances of B, but B contains only one instance of A.**
Let's take for example `User` and `Photo` entities.
User can have multiple photos, but each photo is owned by only one single user.

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne(() => User, (user) => user.photos)
    user: User
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Photo, (photo) => photo.user)
    photos: Photo[]
}
```

Here we added `@OneToMany` to the `photos` property and specified the target relation type to be `Photo`.
You can omit `@JoinColumn` in a `@ManyToOne` / `@OneToMany` relation.
`@OneToMany` cannot exist without `@ManyToOne`.
If you want to use `@OneToMany`, `@ManyToOne` is required. However, the inverse is not required: If you only care about the `@ManyToOne` relationship, you can define it without having `@OneToMany` on the related entity.
Where you set `@ManyToOne` - its related entity will have "relation id" and foreign key.

This example will produce following tables:

```shell
+-------------+--------------+----------------------------+
|                         photo                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| url         | varchar(255) |                            |
| userId      | int(11)      | FOREIGN KEY                |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

# Many-to-many relations

## What are many-to-many relations?

Many-to-many is a relation where A contains multiple instances of B, and B contains multiple instances of A.
Let's take for example `Question` and `Category` entities.
A question can have multiple categories, and each category can have multiple questions.

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Category } from "./Category"

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string

    @ManyToMany(() => Category)
    @JoinTable()
    categories: Category[]
}
```

`@JoinTable()` is required for `@ManyToMany` relations.
You must put `@JoinTable` on one (owning) side of relation.

This example will produce following tables:

```shell
+-------------+--------------+----------------------------+
|                        category                         |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                        question                         |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| title       | varchar(255) |                            |
| text        | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|              question_categories_category               |
+-------------+--------------+----------------------------+
| questionId  | int(11)      | PRIMARY KEY FOREIGN KEY    |
| categoryId  | int(11)      | PRIMARY KEY FOREIGN KEY    |
+-------------+--------------+----------------------------+
```

## Bi-directional relations

Relations can be uni-directional and bi-directional.
Uni-directional relations are relations with a relation decorator only on one side.
Bi-directional relations are relations with decorators on both sides of a relation.

We just created a uni-directional relation. Let's make it bi-directional:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Question } from "./Question"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(() => Question, (question) => question.categories)
    questions: Question[]
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Category } from "./Category"

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string

    @ManyToMany(() => Category, (category) => category.questions)
    @JoinTable()
    categories: Category[]
}
```

We just made our relation bi-directional. Note that the inverse relation does not have a `@JoinTable`.
`@JoinTable` must be only on one side of the relation.

Bi-directional relations allow you to join relations from both sides using `QueryBuilder`:

```typescript
const categoriesWithQuestions = await dataSource
    .getRepository(Category)
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.questions", "question")
    .getMany()
```

## Many-to-many relations with custom properties

In case you need to have additional properties in your many-to-many relationship, you have to create a new entity yourself.
For example, if you would like entities `Question` and `Category` to have a many-to-many relationship with an additional `order` column, then you need to create an entity `QuestionToCategory` with two `ManyToOne` relations pointing in both directions and with custom columns in it:

```typescript
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Question } from "./question"
import { Category } from "./category"

@Entity()
export class QuestionToCategory {
    @PrimaryGeneratedColumn()
    public questionToCategoryId: number

    @Column()
    public questionId: number

    @Column()
    public categoryId: number

    @Column()
    public order: number

    @ManyToOne(() => Question, (question) => question.questionToCategories)
    public question: Question

    @ManyToOne(() => Category, (category) => category.questionToCategories)
    public category: Category
}
```

Additionally you will have to add a relationship like the following to `Question` and `Category`:

```typescript
// category.ts
...
@OneToMany(() => QuestionToCategory, questionToCategory => questionToCategory.category)
public questionToCategories: QuestionToCategory[];

// question.ts
...
@OneToMany(() => QuestionToCategory, questionToCategory => questionToCategory.question)
public questionToCategories: QuestionToCategory[];
```
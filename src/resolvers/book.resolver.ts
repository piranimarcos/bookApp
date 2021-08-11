import { Query, Resolver, Arg, InputType, Field, Mutation } from "type-graphql";
import { getRepository, Repository } from "typeorm";

import { Book } from "./../entity/book.entity";
import { Author } from "./../entity/author.entity";

@InputType()
class BookInput {
  @Field()
  title!: string;

  @Field()
  author!: number;
}

@InputType()
class BookUpdateInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => Number, { nullable: true })
  author?: number;
}

@InputType()
class BookUpdateParseInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => Author, { nullable: true })
  author?: Author;
}

@InputType()
class BookIdInput {
  @Field()
  id!: number;
}

@Resolver()
export class BookResolver {
  bookRepository: Repository<Book>;
  authorRepository: Repository<Author>;

  constructor() {
    this.bookRepository = getRepository(Book);
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Book)
  async createBook(@Arg("input", () => BookInput) input: BookInput) {
    try {
      const author: Author | undefined = await this.authorRepository.findOne(
        input.author
      );

      if (!author) {
        const error = new Error();
        error.message =
          "The author for this book does not exist, please double check";
      }

      const book = await this.bookRepository.insert({
        title: input.title,
        author: author,
      });

      return await this.bookRepository.findOne(book.identifiers[0].id, {
        relations: ["author"],
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Query(() => Book)
  async getBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Book | undefined> {
    try {
      const book = await this.bookRepository.findOne(input.id, {
        relations: ["author"],
      });
      if (!book) {
        const error = new Error();
        error.message = "Book does not found";
        throw error;
      }
      return book;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Query(() => [Book])
  async getAllBooks(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({ relations: ["author"] });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => Boolean)
  async updateBookById(
    @Arg("bookId", () => BookIdInput) bookId: BookIdInput,
    @Arg("input", () => BookUpdateInput) input: BookUpdateInput
  ): Promise<Boolean> {
    try {
      await this.bookRepository.update(bookId.id, await this.parseInput(input));
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => Boolean)
  async deleteBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Boolean> {
    try {
      await this.bookRepository.delete(input.id);
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async parseInput(input: BookUpdateInput) {
    const _input: BookUpdateParseInput = {};

    try {
      if (input.title) {
        _input["title"] = input.title;
      }

      if (input.author) {
        const author = await this.authorRepository.findOne(input.author);
        if (!author) {
          throw new Error("this author does not exist");
        }
        _input["author"] = author;
      }
    } catch (error) {
      throw new Error(error);
    }

    return _input;
  }
}

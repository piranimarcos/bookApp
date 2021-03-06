import { Query, Resolver, Arg, InputType, Field, Mutation } from "type-graphql";
import { Author } from "./../entity/author.entity";
import { getRepository, Repository } from "typeorm";

@InputType()
class AuthorInput {
  @Field()
  fullName!: string;
}

@InputType()
class AuthorUpdateInput {
  @Field(() => Number)
  id!: number;

  @Field()
  fullName?: string;
}

@InputType()
class AuthorIdInput {
  @Field(() => Number)
  id!: number;
}

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Author)
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    try {
      const createAuthor = await this.authorRepository.insert({
        fullName: input.fullName,
      });
      const result = await this.authorRepository.findOne(
        createAuthor.identifiers[0].id
      );
      return result;
    } catch (error) {
      console.error;
    }
  }

  @Query(() => [Author])
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({ relations: ["books"] });
  }

  @Query(() => Author)
  async getOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    try {
      const author = await this.authorRepository.findOne(input.id);
      if (!author) {
        const error = new Error();
        error.message = "Author does not exist!";
        throw error;
      }
      return author;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => Author)
  async updateOneAuthor(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    const authorExist = await this.authorRepository.findOne(input.id);

    if (!authorExist) {
      throw new Error("Author does not exist!");
    }

    const updatedAuthor = await this.authorRepository.save({
      id: input.id,
      fullName: input.fullName,
    });

    return await this.authorRepository.findOne(updatedAuthor.id);
  }

  @Mutation(() => Boolean)
  async deleteOneAuthor(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    await this.authorRepository.delete(input.id);
    return true;
  }
}

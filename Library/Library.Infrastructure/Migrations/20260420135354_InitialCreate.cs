using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Library.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Authors",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying", nullable: false),
                    bio = table.Column<string>(type: "character varying", nullable: true),
                    photo = table.Column<string>(type: "character varying", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Authors_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying", nullable: false),
                    text_file = table.Column<string>(type: "character varying", nullable: false),
                    cover_file = table.Column<string>(type: "character varying", nullable: true),
                    description = table.Column<string>(type: "character varying", nullable: true),
                    Rating = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Books_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Genres",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Genres_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    role = table.Column<string>(type: "character varying", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Roles_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    tag = table.Column<string>(type: "character varying", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Tags_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "book_author",
                columns: table => new
                {
                    book_id = table.Column<int>(type: "integer", nullable: false),
                    author_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("book_author_pkey", x => new { x.book_id, x.author_id });
                    table.ForeignKey(
                        name: "book_author_author_id_fkey",
                        column: x => x.author_id,
                        principalTable: "Authors",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "book_author_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "book_genre",
                columns: table => new
                {
                    book_id = table.Column<int>(type: "integer", nullable: false),
                    genre_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("book_genre_pkey", x => new { x.book_id, x.genre_id });
                    table.ForeignKey(
                        name: "book_genre_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "book_genre_genre_id_fkey",
                        column: x => x.genre_id,
                        principalTable: "Genres",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    login = table.Column<string>(type: "character varying", nullable: false),
                    password_hash = table.Column<string>(type: "character varying", nullable: false),
                    email = table.Column<string>(type: "character varying", nullable: false),
                    normalized_email = table.Column<string>(type: "character varying", nullable: false),
                    normalized_login = table.Column<string>(type: "character varying", nullable: false),
                    role_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Users_pkey", x => x.id);
                    table.ForeignKey(
                        name: "Users_role_id_fkey",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "book_tag",
                columns: table => new
                {
                    book_id = table.Column<int>(type: "integer", nullable: false),
                    tag_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("book_tag_pkey", x => new { x.book_id, x.tag_id });
                    table.ForeignKey(
                        name: "book_tag_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "book_tag_tag_id_fkey",
                        column: x => x.tag_id,
                        principalTable: "Tags",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Bookmarks",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    book_id = table.Column<int>(type: "integer", nullable: false),
                    page = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Bookmarks_pkey", x => new { x.user_id, x.book_id });
                    table.ForeignKey(
                        name: "Bookmarks_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "Bookmarks_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Collections",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Collection_pkey", x => x.id);
                    table.ForeignKey(
                        name: "Collection_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "favourite_book",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    book_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("favourite_book_pkey", x => new { x.user_id, x.book_id });
                    table.ForeignKey(
                        name: "favourite_book_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "favourite_book_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "reading_book",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    book_id = table.Column<int>(type: "integer", nullable: false),
                    page = table.Column<int>(type: "integer", nullable: false),
                    last_opened = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("reading_book_pkey", x => new { x.user_id, x.book_id });
                    table.ForeignKey(
                        name: "reading_book_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "reading_book_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    rate = table.Column<int>(type: "integer", nullable: false),
                    review_text = table.Column<string>(type: "character varying", nullable: true),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    book_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("Reviews_pkey", x => x.id);
                    table.ForeignKey(
                        name: "Reviews_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "Reviews_user_id_fkey",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "collection_book",
                columns: table => new
                {
                    collection_id = table.Column<int>(type: "integer", nullable: false),
                    book_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("collection_book_pkey", x => new { x.collection_id, x.book_id });
                    table.ForeignKey(
                        name: "collection_book_book_id_fkey",
                        column: x => x.book_id,
                        principalTable: "Books",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "collection_book_collection_id_fkey",
                        column: x => x.collection_id,
                        principalTable: "Collections",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_book_author_author_id",
                table: "book_author",
                column: "author_id");

            migrationBuilder.CreateIndex(
                name: "IX_book_genre_genre_id",
                table: "book_genre",
                column: "genre_id");

            migrationBuilder.CreateIndex(
                name: "IX_book_tag_tag_id",
                table: "book_tag",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_book_id",
                table: "Bookmarks",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "IX_collection_book_book_id",
                table: "collection_book",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "IX_Collections_user_id",
                table: "Collections",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_favourite_book_book_id",
                table: "favourite_book",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "IX_reading_book_book_id",
                table: "reading_book",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_book_id",
                table: "Reviews",
                column: "book_id");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_user_id",
                table: "Reviews",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_role_id",
                table: "Users",
                column: "role_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "book_author");

            migrationBuilder.DropTable(
                name: "book_genre");

            migrationBuilder.DropTable(
                name: "book_tag");

            migrationBuilder.DropTable(
                name: "Bookmarks");

            migrationBuilder.DropTable(
                name: "collection_book");

            migrationBuilder.DropTable(
                name: "favourite_book");

            migrationBuilder.DropTable(
                name: "reading_book");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Authors");

            migrationBuilder.DropTable(
                name: "Genres");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Collections");

            migrationBuilder.DropTable(
                name: "Books");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}

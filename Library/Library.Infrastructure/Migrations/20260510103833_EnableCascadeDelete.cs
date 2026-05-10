using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Library.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnableCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "Bookmarks_book_id_fkey",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "collection_book_book_id_fkey",
                table: "collection_book");

            migrationBuilder.DropForeignKey(
                name: "collection_book_collection_id_fkey",
                table: "collection_book");

            migrationBuilder.DropForeignKey(
                name: "reading_book_book_id_fkey",
                table: "reading_book");

            migrationBuilder.DropForeignKey(
                name: "Reviews_book_id_fkey",
                table: "Reviews");

            migrationBuilder.AddForeignKey(
                name: "Bookmarks_book_id_fkey",
                table: "Bookmarks",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "collection_book_book_id_fkey",
                table: "collection_book",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "collection_book_collection_id_fkey",
                table: "collection_book",
                column: "collection_id",
                principalTable: "Collections",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "reading_book_book_id_fkey",
                table: "reading_book",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "Reviews_book_id_fkey",
                table: "Reviews",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "Bookmarks_book_id_fkey",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "collection_book_book_id_fkey",
                table: "collection_book");

            migrationBuilder.DropForeignKey(
                name: "collection_book_collection_id_fkey",
                table: "collection_book");

            migrationBuilder.DropForeignKey(
                name: "reading_book_book_id_fkey",
                table: "reading_book");

            migrationBuilder.DropForeignKey(
                name: "Reviews_book_id_fkey",
                table: "Reviews");

            migrationBuilder.AddForeignKey(
                name: "Bookmarks_book_id_fkey",
                table: "Bookmarks",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "collection_book_book_id_fkey",
                table: "collection_book",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "collection_book_collection_id_fkey",
                table: "collection_book",
                column: "collection_id",
                principalTable: "Collections",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "reading_book_book_id_fkey",
                table: "reading_book",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "Reviews_book_id_fkey",
                table: "Reviews",
                column: "book_id",
                principalTable: "Books",
                principalColumn: "id");
        }
    }
}

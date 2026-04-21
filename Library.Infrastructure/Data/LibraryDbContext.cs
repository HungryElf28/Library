using System;
using System.Collections.Generic;
using Library.Infrastructure.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Library.Infrastructure.Data;

public partial class LibraryDbContext : DbContext
{
    public LibraryDbContext()
    {
    }

    public LibraryDbContext(DbContextOptions<LibraryDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Author> Authors { get; set; }

    public virtual DbSet<Book> Books { get; set; }

    public virtual DbSet<Bookmark> Bookmarks { get; set; }

    public virtual DbSet<Collection> Collections { get; set; }

    public virtual DbSet<Genre> Genres { get; set; }

    public virtual DbSet<ReadingBook> ReadingBooks { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=VKR_Lib;Username=postgres;Password=123");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Author>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Authors_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Bio)
                .HasColumnType("character varying")
                .HasColumnName("bio");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Photo)
                .HasColumnType("character varying")
                .HasColumnName("photo");
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Books_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.CoverFile)
                .HasColumnType("character varying")
                .HasColumnName("cover_file");
            entity.Property(e => e.Description)
                .HasColumnType("character varying")
                .HasColumnName("description");
            entity.Property(e => e.TextFile)
                .HasColumnType("character varying")
                .HasColumnName("text_file");
            entity.Property(e => e.Title)
                .HasColumnType("character varying")
                .HasColumnName("title");

            entity.HasMany(d => d.Authors).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookAuthor",
                    r => r.HasOne<Author>().WithMany()
                        .HasForeignKey("AuthorId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("book_author_author_id_fkey"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("book_author_book_id_fkey"),
                    j =>
                    {
                        j.HasKey("BookId", "AuthorId").HasName("book_author_pkey");
                        j.ToTable("book_author");
                        j.IndexerProperty<int>("BookId").HasColumnName("book_id");
                        j.IndexerProperty<int>("AuthorId").HasColumnName("author_id");
                    });

            entity.HasMany(d => d.Genres).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookGenre",
                    r => r.HasOne<Genre>().WithMany()
                        .HasForeignKey("GenreId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("book_genre_genre_id_fkey"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("book_genre_book_id_fkey"),
                    j =>
                    {
                        j.HasKey("BookId", "GenreId").HasName("book_genre_pkey");
                        j.ToTable("book_genre");
                        j.IndexerProperty<int>("BookId").HasColumnName("book_id");
                        j.IndexerProperty<int>("GenreId").HasColumnName("genre_id");
                    });

            entity.HasMany(d => d.Tags).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookTag",
                    r => r.HasOne<Tag>().WithMany()
                        .HasForeignKey("TagId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("book_tag_tag_id_fkey"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("book_tag_book_id_fkey"),
                    j =>
                    {
                        j.HasKey("BookId", "TagId").HasName("book_tag_pkey");
                        j.ToTable("book_tag");
                        j.IndexerProperty<int>("BookId").HasColumnName("book_id");
                        j.IndexerProperty<int>("TagId").HasColumnName("tag_id");
                    });
        });

        modelBuilder.Entity<Bookmark>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.BookId }).HasName("Bookmarks_pkey");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.BookId).HasColumnName("book_id");
            entity.Property(e => e.Page).HasColumnName("page");

            entity.HasOne(d => d.Book).WithMany(p => p.Bookmarks)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Bookmarks_book_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Bookmarks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Bookmarks_user_id_fkey");
        });

        modelBuilder.Entity<Collection>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Collection_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Title)
                .HasColumnType("character varying")
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Collections)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Collection_user_id_fkey");

            entity.HasMany(d => d.Books).WithMany(p => p.Collections)
                .UsingEntity<Dictionary<string, object>>(
                    "CollectionBook",
                    r => r.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("collection_book_book_id_fkey"),
                    l => l.HasOne<Collection>().WithMany()
                        .HasForeignKey("CollectionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("collection_book_collection_id_fkey"),
                    j =>
                    {
                        j.HasKey("CollectionId", "BookId").HasName("collection_book_pkey");
                        j.ToTable("collection_book");
                        j.IndexerProperty<int>("CollectionId").HasColumnName("collection_id");
                        j.IndexerProperty<int>("BookId").HasColumnName("book_id");
                    });
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Genres_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
        });

        modelBuilder.Entity<ReadingBook>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.BookId }).HasName("reading_book_pkey");

            entity.ToTable("reading_book");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.BookId).HasColumnName("book_id");
            entity.Property(e => e.LastOpened).HasColumnName("last_opened");
            entity.Property(e => e.Page).HasColumnName("page");

            entity.HasOne(d => d.Book).WithMany(p => p.ReadingBooks)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("reading_book_book_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.ReadingBooks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("reading_book_user_id_fkey");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Reviews_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.BookId).HasColumnName("book_id");
            entity.Property(e => e.Rate).HasColumnName("rate");
            entity.Property(e => e.ReviewText)
                .HasColumnType("character varying")
                .HasColumnName("review_text");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Book).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Reviews_book_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Reviews_user_id_fkey");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Roles_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Role1)
                .HasColumnType("character varying")
                .HasColumnName("role");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Tags_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("tag");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Users_pkey");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Email)
                .HasColumnType("character varying")
                .HasColumnName("email");
            entity.Property(e => e.Login)
                .HasColumnType("character varying")
                .HasColumnName("login");
            entity.Property(e => e.NormalizedEmail)
                .HasColumnType("character varying")
                .HasColumnName("normalized_email");
            entity.Property(e => e.NormalizedLogin)
                .HasColumnType("character varying")
                .HasColumnName("normalized_login");
            entity.Property(e => e.PasswordHash)
                .HasColumnType("character varying")
                .HasColumnName("password_hash");
            entity.Property(e => e.RoleId).HasColumnName("role_id");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Users_role_id_fkey");

            entity.HasMany(d => d.Books).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "FavouriteBook",
                    r => r.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("favourite_book_book_id_fkey"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("favourite_book_user_id_fkey"),
                    j =>
                    {
                        j.HasKey("UserId", "BookId").HasName("favourite_book_pkey");
                        j.ToTable("favourite_book");
                        j.IndexerProperty<int>("UserId").HasColumnName("user_id");
                        j.IndexerProperty<int>("BookId").HasColumnName("book_id");
                    });
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

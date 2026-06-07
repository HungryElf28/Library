using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Application.Services
{
    public class TagService
    {
        private readonly ITagRepository _repo;

        public TagService(ITagRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<Tag>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<(List<Tag> Items, int TotalCount)> GetPaged(string? searchTerm, int page, int pageSize)
        {
            return await _repo.GetPagedAsync(searchTerm, page, pageSize);
        }

        public async Task<Tag?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<Tag> AddAsync(Tag tag)
        {
            var exists = await _repo.ExistsByNameAsync(tag.Name);

            if (exists)
                throw new Exception("Tag already exists");
            return await _repo.AddAsync(tag);
        }

        public async Task UpdateAsync(Tag tag)
        {
            var exists = await _repo.GetByIdAsync(tag.Id);
            if (exists == null)
                throw new Exception("Tag not found");
            await _repo.UpdateAsync(tag);
        }

        public async Task DeleteAsync(int id)
        {
            var tag = await _repo.GetByIdAsync(id);

            if (tag == null)
                throw new Exception("Tag not found");
            await _repo.DeleteAsync(id);
        }
    }
}

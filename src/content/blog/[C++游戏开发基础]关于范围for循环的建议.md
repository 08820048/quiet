# [C++游戏开发基础]:关于范围for循环的使用

都知道,使用普通的for循环容易产生问题,第一是索引越界的问题,其次是索引符号的问题。所以一般情况下,在 C++ 编程中，尽量避免使用` array[index]` 形式的 **整数索引** 来访问数组或容器的元素，而是推荐使用 **迭代器** 或 **范围 for 循环** 来进行遍历和操作。

---

## 基本用法

出于上述等情况的考虑,C++支持另一种类型的for循环,那就是 **基于范围的for循环。**,它允许遍历容器而无需显式索引,使用更加简单安全。基本语法如下

```cpp
for (element_declaration : array_object)
   statement;
```

当遇到基于范围的 for 循环时，循环将遍历 `array_object` 中的每个元素。对于每次迭代，当前数组元素的值将被赋给 `element_declaration` 中声明的变量，然后执行 `statement`。

为了获得最佳结果，`element_declaration` 应该与数组元素具有相同的类型，否则将发生类型转换。下面是一个简单的示例,旨在演示范围for循环的用法:

```cpp
#include<iostream>
#include<vector>

int main()
{
    std::vector datas {1,1,2,45,6,6,-1,8,9,43};
    for (int num : datas)
    {
        std::cout <<num <<' ';
    }
    std::cout <<'\n';

    return 0;
}
```

> 1 1 2 45 6 6 -1 8 9 43

在这个例子中,我们不需要知道数组的长度,也不需要使用索引。 因为其中的`num`是被赋予数组元素的值,这意味着数组元素被复制(提到复制,务必考虑高成本数据类型的情况)

> 在编译容器时,建议优先使用基于范围的for循环,而不是常规的索引for循环。

和普通的循环不同,对于范围for循环来说,如果遍历的容器没有元素的情况下,循环主体是不会执行的。

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector empty { };

    for (int num : empty)
       std::cout << "Hi man!\n";

    return 0;
}
```

---

## 关于auto关键字的几点建议

因为 `element_declaration` 应该与数组元素具有相同的类型（以防止类型转换发生），这是使用 `auto` 关键字的理想情况，让编译器为我们推导数组元素的类型。这样我们就不必冗余地指定类型，也不会有意外输入错误的风险。 

下面是使用`auto`关键字的版本:

```cpp
#include<iostream>
#include<vector>

int main()
{
    std::vector datas {1,1,2,45,6,6,-1,8,9,43};
    for (auto num : datas)
    {
        std::cout <<num <<' ';
    }
    std::cout <<'\n';

    return 0;
}

```

使用`auto`的好处之一是,如果数组元素类型更新了,比如从`int`更新到`long`.  此时如果使用了`auto`   ,它将自动推断更新后的元素类型,确保更新同步,这样可以有效的防止类型转换的发生。

另外,在 C++ 代码中，**尽量避免拷贝容器中的元素，而是使用引用（&）来访问和操作元素**。

```cpp
#include <iostream>
#include <string>
#include <vector>

int main()
{
    std::vector<std::string> words{ "C++", "Java", "rust", "python" };

    for (auto word : words)
        std::cout << word << ' ';

    std::cout << '\n';

    return 0;
}
```

- 代码中使用 **值拷贝** 遍历 words，word 是 words 中元素的副本。
- 就例子本身来说,这个拷贝是多余的,这里我们只是遍历`words`来输出展示,并没有修改数据,因此使用值拷贝的方式增加了不必要的性能开销。

因此,我们可以使用引用的方式来改进:

```cpp
#include <iostream>
#include <string>
#include <vector>

int main()
{
    std::vector<std::string> words{ "C++", "Java", "rust", "python" };

    for (const auto& word : words)
        std::cout << word << ' ';

    std::cout << '\n';

    return 0;
}

```

在上面的例子中，`word` 现在是一个` const` 引用。在这个循环的每一次迭代中，`word` 将被绑定到下一个数组元素。这允许我们访问数组元素的值而避免了昂贵的复制开销。

---

通常,我们会使用`auto`来自动推导元素类型,当需要修改元素时,可以使用`auto&`,对于高成本复制类型来说,`const auto&`用的更多。但是许多开发人员认为,范围for循环中建议总是使用`const auto&`,因为它的兼容性更强。

还是刚才那个例子的改版:

```cpp
#include <iostream>
#include <string>
#include<string_view>
#include <vector>

int main()
{
    std::vector<std::string_view> words{ "C++", "Java", "rust", "python" };

    for (auto word : words)
        std::cout << word << ' ';

    std::cout << '\n';

    return 0;
}

```

> 在这个示例中，我们有一个` std::vector`，其中包含 `std::string_view` 对象。由于 `std::string_view `通常是按值传递的，因此使用 `auto `似乎是合适的。

同样的例子,一旦数据类型由`std::string_viuew`更新为`std::string`,而我们依旧使用的是`auto`,那么这意味着会产生高昂的复制成本。

**最佳做法:**

> - **auto**：适用于当你希望修改元素副本时。
>
> - **auto&**：适用于当你希望修改容器中原始元素时。
>
> - **const auto&**：适用于当你只需要查看原始元素而不进行修改时。

使用 `const auto&` 作为范围 `for` 循环中的元素类型。这能有效避免不必要的拷贝，提升性能，并避免将来可能的性能瓶颈。

---

## **Reverse**

基于范围的 for 循环仅按正序进行排序。但是，在某些情况下，我们希望以相反的顺序遍历数组。在C++20之前一般是用户自己实现,比如使用普通for循环,但是在C++20之后,你可以使用 Ranges 库的 `std::views::reverse` 功能来实现这个需求。 

```cpp
#include <iostream>
#include <ranges> // C++20
#include <string_view>
#include <vector>

int main()
{
    std::vector<std::string_view> words{ "C++", "java", "rust", "python" }; 

    for (const auto& word : std::views::reverse(words))
        std::cout << word << ' ';

    std::cout << '\n';

    return 0;
}
```

> python
>
> rust
>
> java
>
> c++